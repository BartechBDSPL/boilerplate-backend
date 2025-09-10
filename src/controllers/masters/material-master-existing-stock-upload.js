import { executeQuery, sql } from '../../config/db.js';
import multer from 'multer';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
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

// Initialize upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('excelFile');

export const uploadMaterialExistingStock = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          Status: 'F',
          Message: err.message,
        });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({
          Status: 'F',
          Message: 'Please upload an Excel file',
        });
      }

      const filePath = req.file.path;

      try {
        // Read the Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
          // Delete the file after processing
          fs.unlinkSync(filePath);
          return res.status(400).json({
            Status: 'F',
            Message: 'Excel file is empty',
          });
        }

        // Check if required headers exist
        const requiredHeaders = [
          'Material',
          'Material Description',
          'Qty per Pallet',
          'Pcs per Packunit',
          'Packunit per Pallet',
        ];

        const fileHeaders = Object.keys(data[0]);
        const missingHeaders = requiredHeaders.filter(
          header => !fileHeaders.includes(header)
        );

        if (missingHeaders.length > 0) {
          // Delete the file after processing
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

        const User = req.body.User;

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
              const material = row['Material'];
              const materialText = row['Material Description'];
              const qtyPerPallet = row['Qty per Pallet'];
              const pcsPerPackunit = row['Pcs per Packunit'];
              const packunitPerPallet = row['Packunit per Pallet'];

              const result = await executeQuery(
                'EXEC Sp_Upsert_Material_Master_ExistingStock @MATERIAL, @MATERIAL_TEXT, @QtyPerPallet, @PcsPerPackunit, @PackUnitPerPallet, @CreatedBy',
                [
                  { name: 'MATERIAL', type: sql.NVarChar, value: material },
                  {
                    name: 'MATERIAL_TEXT',
                    type: sql.NVarChar,
                    value: materialText,
                  },
                  {
                    name: 'QtyPerPallet',
                    type: sql.Decimal,
                    value: qtyPerPallet || 0,
                  },
                  {
                    name: 'PcsPerPackunit',
                    type: sql.Decimal,
                    value: pcsPerPackunit || 0,
                  },
                  {
                    name: 'PackUnitPerPallet',
                    type: sql.Decimal,
                    value: packunitPerPallet || 0,
                  },
                  { name: 'CreatedBy', type: sql.NVarChar, value: User },
                ]
              );

              // The stored procedure returns a result set with Status column
              if (result && result.recordset.length > 0) {
                const spResult = result[0];
                return {
                  row,
                  Status: spResult.Status,
                  Message: spResult.Message || 'Operation successful',
                };
              } else {
                return {
                  row,
                  Status: 'F',
                  Message: 'No result returned from stored procedure',
                };
              }
            } catch (error) {
              return {
                row,
                Status: 'F',
                Message: error.message,
              };
            }
          });

          const chunkResults = await Promise.all(chunkPromises);

          // Categorize the results
          chunkResults.forEach(result => {
            if (result.Status === 'T') {
              results.success.push({
                row: result.row,
                message: result.Message,
              });
            } else {
              results.failure.push({
                row: result.row,
                message: result.Message,
              });
            }
          });
        }

        // Delete the file after processing
        fs.unlinkSync(filePath);

        return res.status(200).json({
          Status: 'T',
          Message: 'Excel file processed',
          results: {
            totalProcessed: data.length,
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

export const insertMaterialExistingStock = async (req, res) => {
  try {
    const {
      Material,
      MaterialText,
      QtyPerPallet,
      PcsPerPackunit,
      PackUnitPerPallet,
      User,
    } = req.body;

    if (!Material || !MaterialText) {
      return res.status(400).json({
        Status: 'F',
        Message: 'Material and MaterialText are required',
      });
    }

    const result = await executeQuery(
      'EXEC Sp_MaterialMaster_ExistingStock_Insert @Material, @MaterialText, @QtyPerPallet, @PcsPerPackunit, @PackUnitPerPallet, @CreatedBy',
      [
        { name: 'Material', type: sql.NVarChar, value: Material },
        { name: 'MaterialText', type: sql.NVarChar, value: MaterialText },
        { name: 'QtyPerPallet', type: sql.Decimal, value: QtyPerPallet || 0 },
        {
          name: 'PcsPerPackunit',
          type: sql.Decimal,
          value: PcsPerPackunit || 0,
        },
        {
          name: 'PackUnitPerPallet',
          type: sql.Decimal,
          value: PackUnitPerPallet || 0,
        },
        { name: 'CreatedBy', type: sql.NVarChar, value: User },
      ]
    );

    if (result) {
      const spResult = result[0];
      return res.status(200).json(spResult);
    }
  } catch (error) {
    return res.status(500).json({
      Status: 'F',
      Message: 'Error inserting material existing stock',
      error: error.message,
    });
  }
};

export const updateMaterialExistingStock = async (req, res) => {
  try {
    const {
      Mid,
      Material,
      MaterialText,
      QtyPerPallet,
      PcsPerPackunit,
      PackUnitPerPallet,
      User,
    } = req.body;

    if (!Mid) {
      return res.status(400).json({
        Status: 'F',
        Message: 'Mid is required',
      });
    }

    const result = await executeQuery(
      'EXEC Sp_MaterialMaster_ExistingStock_Update @Mid, @Material, @MaterialText, @QtyPerPallet, @PcsPerPackunit, @PackUnitPerPallet, @Update_By',
      [
        { name: 'Mid', type: sql.Int, value: Mid },
        { name: 'Material', type: sql.NVarChar, value: Material },
        { name: 'MaterialText', type: sql.NVarChar, value: MaterialText },
        { name: 'QtyPerPallet', type: sql.Decimal, value: QtyPerPallet || 0 },
        {
          name: 'PcsPerPackunit',
          type: sql.Decimal,
          value: PcsPerPackunit || 0,
        },
        {
          name: 'PackUnitPerPallet',
          type: sql.Decimal,
          value: PackUnitPerPallet || 0,
        },
        { name: 'Update_By', type: sql.NVarChar, value: User },
      ]
    );

    if (result) {
      const spResult = result[0];
      return res.status(200).json(spResult);
    }
  } catch (error) {
    return res.status(500).json({
      Status: 'F',
      Message: 'Error updating material existing stock',
      error: error.message,
    });
  }
};

export const getAllMaterialUploaded = async (req, res) => {
  try {
    const result = await executeQuery(
      'EXEC Sp_MaterialMaster_ExistingStock_GetAll',
      []
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      Status: 'F',
      Message: 'Error retrieving data',
      error: error.message,
    });
  }
};
