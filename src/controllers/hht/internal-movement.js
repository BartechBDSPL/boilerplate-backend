import { executeQuery, sql } from '../../config/db.js';

export const hhtInternalMovementValidation = async (req, res) => {
  try {
    const { serial_no } = req.body;

    const result = await executeQuery(`EXEC [dbo].[hht_internal_movement_validation] @serial_no`, [
      { name: 'serial_no', type: sql.NVarChar(255), value: serial_no },
    ]);

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const hhtInternalMovementUpdate = async (req, res) => {
  const { serial_no, old_location, new_location, move_by, warehouse } = req.body;

  try {
    const serialNumbers = serial_no.split('$');
    let finalResult = { Status: 'T', Message: 'Internal Movement Done' };
    console.log(req.body);

    for (const serialNo of serialNumbers) {
      if (serialNo.trim()) {
        const result = await executeQuery(
          `EXEC [dbo].[hht_internal_movement_update] @serial_no, @old_location, @new_location, @move_by, @warehouse`,
          [
            { name: 'serial_no', type: sql.NVarChar(255), value: serialNo.trim() },
            { name: 'old_location', type: sql.NVarChar(50), value: old_location },
            { name: 'new_location', type: sql.NVarChar(50), value: new_location },
            { name: 'move_by', type: sql.NVarChar(50), value: move_by },
            { name: 'warehouse', type: sql.NVarChar(50), value: warehouse },
          ]
        );

        console.log('params', [
          { name: 'serial_no', type: sql.NVarChar(255), value: serialNo.trim() },
          { name: 'old_location', type: sql.NVarChar(50), value: old_location },
          { name: 'new_location', type: sql.NVarChar(50), value: new_location },
          { name: 'move_by', type: sql.NVarChar(50), value: move_by },
          { name: 'warehouse', type: sql.NVarChar(50), value: warehouse },
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
    console.error('Error in hhtInternalMovementUpdate:', error);
    res.status(500).json({ Status: 'F', Message: 'Internal server error' });
  }
};
