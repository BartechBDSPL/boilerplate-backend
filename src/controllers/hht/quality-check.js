import { executeQuery, sql } from '../../config/db.js';

export const qcValidation = async (req, res) => {
  const { serial_no } = req.body;

  try {
    const result = await executeQuery(`EXEC [dbo].[hht_qc_validation] @serial_no`, [
      { name: 'serial_no', type: sql.NVarChar, value: serial_no },
    ]);

    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(500).json({ Status: 'F', Message: 'Unexpected error' });
    }
  } catch (error) {
    console.error('Error in qcValidation:', error);
    res.status(500).json({ Status: 'F', Message: 'Internal server error' });
  }
};

export const qcUpdate = async (req, res) => {
  const { serial_no, qc_status, qc_remark, qc_by,checklist } = req.body;
  console.log('Received checklist:', checklist);

  try {
    const serialNumbers = serial_no.split('$');
    let finalResult = { Status: 'T', Message: 'QC Done' };
    console.log(req.body);

    const imagePath = req.file ? req.file.filename : null;
    if (imagePath) {
      console.log('Image uploaded:', imagePath);
    } else {
      console.log('No image provided, image_path will be null');
    }

    for (const serialNo of serialNumbers) {
      if (serialNo.trim()) {
        const result = await executeQuery(
          `EXEC [dbo].[hht_qc_update] @serial_no, @qc_status, @qc_remark, @qc_by, @image_path, @checklist`,
          [
            { name: 'serial_no', type: sql.NVarChar, value: serialNo.trim() },
            { name: 'qc_status', type: sql.NVarChar, value: qc_status },
            { name: 'qc_remark', type: sql.NVarChar, value: qc_remark },
            { name: 'qc_by', type: sql.NVarChar, value: qc_by },
            { name: 'image_path', type: sql.NVarChar, value: imagePath },
            { name: 'checklist', type: sql.NVarChar, value: checklist },
          ]
        );

        if (result.length > 0) {
          if (result[0].Status === 'F') {
            return res.status(500).json(result[0]);
          }
          finalResult = result[0];
        } else {
          return res.status(500).json({ Status: 'F', Message: 'Unexpected error' });
        }
      }
    }

    res.json(finalResult);
  } catch (error) {
    console.error('Error in qcUpdate:', error);
    res.status(500).json({ Status: 'F', Message: 'Internal server error' });
  }
};
