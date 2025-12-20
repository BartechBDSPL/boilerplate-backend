import { executeQuery, sql } from '../../config/db.js';

export const hhtReworkValidation = async (req, res) => {
  try {
    const { serial_no } = req.body;

    const result = await executeQuery(`EXEC [dbo].[hht_rework_validation] @serial_no`, [
      { name: 'serial_no', type: sql.NVarChar(255), value: serial_no },
    ]);
    console.log(result);

    if (result[0] && result[0].image_path) {
      if (Array.isArray(result[0].image_path)) {
        result[0].image_path = result[0].image_path[0] ? `/images/qc/${result[0].image_path[0]}` : null;
      } else if (typeof result[0].image_path === 'string' && result[0].image_path.trim() !== '') {
        result[0].image_path = `/images/qc/${result[0].image_path}`;
      } else {
        result[0].image_path = null;
      }
    } else if (result[0]) {
      result[0].image_path = null;
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const hhtReworkUpdate = async (req, res) => {
  const { serial_no, rework_by, rework_remark } = req.body;

  try {
    const serialNumbers = serial_no.split('$');
    let finalResult = { Status: 'T', Message: 'Rework Done' };
    console.log(req.body);

    for (const serialNo of serialNumbers) {
      if (serialNo.trim()) {
        const result = await executeQuery(`EXEC [dbo].[hht_rework_update] @serial_no, @rework_by, @rework_remark`, [
          { name: 'serial_no', type: sql.NVarChar(255), value: serialNo.trim() },
          { name: 'rework_by', type: sql.NVarChar(50), value: rework_by },
          { name: 'rework_remark', type: sql.NVarChar(200), value: rework_remark },
        ]);

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
    console.error('Error in hhtReworkUpdate:', error);
    res.status(500).json({ Status: 'F', Message: 'Internal server error' });
  }
};
