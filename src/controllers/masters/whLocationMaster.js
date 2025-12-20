import { executeQuery } from '../../config/db.js';
import { sql } from '../../config/db.js';
import multer from 'multer';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

// Helper function to clean special characters from Excel data
const cleanSpecialCharacters = (value) => {
  if (!value) return value;
  if (typeof value !== 'string') return value;
  return value
    .replace(/\u00AD/g, '-')  // Replace soft hyphen with regular hyphen
    .replace(/˚/g, '°')        // Replace ring above with degree symbol
    .replace(/­/g, '-')        // Replace any other soft hyphens
    .trim();
};

export const getAllDetails = async (req, res) => {
  try {
    const result = await executeQuery(`EXEC sp_warehouse_location_master_get_all_details`);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getAllWhCode = async (req, res) => {
  try {
    const result = await executeQuery(`EXEC sp_warehouse_master_get_warehouse_code`);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const insertDetails = async (req, res) => {
  const { WarehouseCode, Location, User, Status } = req.body;

  try {
    const result = await executeQuery(
      'EXEC sp_warehouse_location_insert @warehouse_code, @location, @location_status, @created_by',
      [
        { name: 'warehouse_code', type: sql.NVarChar, value: WarehouseCode },
        { name: 'location', type: sql.NVarChar, value: Location },
        { name: 'created_by', type: sql.NVarChar, value: User },
        { name: 'location_status', type: sql.NVarChar, value: Status },
      ]
    );

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateDetails = async (req, res) => {
  const { Id, WarehouseCode, Location, User, Status } = req.body;
  try {
    const result = await executeQuery(
      'EXEC sp_warehouse_location_update @id, @warehouse_code, @location, @location_status, @updated_by',
      [
        { name: 'id', type: sql.Int, value: Id },
        { name: 'warehouse_code', type: sql.NVarChar, value: WarehouseCode },
        { name: 'location', type: sql.NVarChar, value: Location },
        { name: 'location_status', type: sql.NVarChar, value: Status },
        { name: 'updated_by', type: sql.NVarChar, value: User },
      ]
    );

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.xlsx', '.xls'];
  const extname = path.extname(file.originalname).toLowerCase();
  if (allowedFileTypes.includes(extname)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('excelFile');

export const uploadWhLocationExcel = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          Status: 'F',
          Message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          Status: 'F',
          Message: 'Please upload an Excel file',
        });
      }

      const filePath = req.file.path;

      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
          fs.unlinkSync(filePath);
          return res.status(400).json({
            Status: 'F',
            Message: 'Excel file is empty',
          });
        }

        const requiredHeaders = ['Warehouse Code', 'Location', 'Status'];

        const fileHeaders = Object.keys(data[0]);
        const missingHeaders = requiredHeaders.filter(header => !fileHeaders.includes(header));

        if (missingHeaders.length > 0) {
          fs.unlinkSync(filePath);
          return res.status(400).json({
            Status: 'F',
            Message: `Missing required headers: ${missingHeaders.join(', ')}`,
          });
        }

        const results = {
          success: [],
          failure: [],
        };

        const username = req.body.username;

        const chunkArray = (array, chunkSize) => {
          const chunks = [];
          for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
          }
          return chunks;
        };

        const CHUNK_SIZE = 50;
        const dataChunks = chunkArray(data, CHUNK_SIZE);

        for (const chunk of dataChunks) {
          const chunkPromises = chunk.map(async row => {
            try {
              const warehouseCode = cleanSpecialCharacters(row['Warehouse Code']);
              const location = cleanSpecialCharacters(row['Location']);
              const status = cleanSpecialCharacters(row['Status']);

              const result = await executeQuery(
                'EXEC sp_warehouse_location_master_upsert_details @warehouse_code, @location, @location_status, @updated_by',
                [
                  {
                    name: 'warehouse_code',
                    type: sql.NVarChar,
                    value: warehouseCode || '',
                  },
                  { name: 'location', type: sql.NVarChar, value: location || '' },
                  { name: 'location_status', type: sql.NVarChar, value: status || '' },
                  { name: 'updated_by', type: sql.NVarChar, value: username },
                ]
              );

              const spResult = result[0];

              return {
                row,
                status: spResult.Status,
                message: spResult.Message || spResult.ErrorMsg,
              };
            } catch (error) {
              return {
                row,
                status: 'F',
                message: error.message,
              };
            }
          });

          const chunkResults = await Promise.all(chunkPromises);

          chunkResults.forEach(result => {
            if (result.status === 'T') {
              results.success.push({
                row: result.row,
                Message: result.message,
              });
            } else {
              results.failure.push({
                row: result.row,
                Message: result.message,
              });
            }
          });
        }

        fs.unlinkSync(filePath);

        return res.status(200).json({
          Status: 'T',
          Message: 'Excel file processed',
          results: {
            totalProcessed: data.length,
            successCount: results.success.length,
            failureCount: results.failure.length,
            failures: results.failure.length > 0 ? results.failure : null,
          },
        });
      } catch (error) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        return res.status(500).json({
          Status: 'F',
          Message: 'Error processing Excel file',
          error: error.message,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      Status: 'F',
      Message: 'Server error',
      error: error.message,
    });
  }
};
