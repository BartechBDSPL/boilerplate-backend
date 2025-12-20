import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../images/qc');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const serialNo = req.body.serial_no || 'unknown';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${serialNo}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(null, false);
    req.fileValidationError = 'Only image files are allowed!';
  }
};

const uploadInstance = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const upload = {
  single: fieldName => {
    return (req, res, next) => {
      uploadInstance.single(fieldName)(req, res, err => {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(200).json({
              Status: 'F',
              Message: 'File size exceeds 5MB limit!',
            });
          }
          return res.status(200).json({
            Status: 'F',
            Message: err.message,
          });
        } else if (err) {
          return res.status(200).json({
            Status: 'F',
            Message: err.message || 'File upload error!',
          });
        }

        if (req.fileValidationError) {
          return res.status(200).json({
            Status: 'F',
            Message: req.fileValidationError,
          });
        }

        next();
      });
    };
  },
};

export default upload;
