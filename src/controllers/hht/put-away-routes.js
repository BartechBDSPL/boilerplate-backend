import { executeQuery, sql } from '../../config/db.js';

export const hhtPutawayValidation = async (req, res) => {
  try {
    const { serial_no } = req.body;
    console.log(req.body);
    const result = await executeQuery(`EXEC [dbo].[hht_putaway_validation] @serial_no`, [
      { name: 'serial_no', type: sql.NVarChar(255), value: serial_no },
    ]);

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const hhtPutawayUpdate = async (req, res) => {
  const { serial_no, put_location, put_by, put_warehouse } = req.body;

  try {
    const serialNumbers = serial_no.split('$');
    let finalResult = { Status: 'T', Message: 'Putaway Done' };
    console.log(req.body);

    for (const serialNo of serialNumbers) {
      if (serialNo.trim()) {
        console.log('Parameters:', [
          { name: 'serial_no', type: sql.NVarChar, value: serialNo.trim() },
          { name: 'put_location', type: sql.NVarChar, value: put_location },
          { name: 'put_by', type: sql.NVarChar, value: put_by },
          { name: 'put_warehouse', type: sql.NVarChar, value: put_warehouse },
        ]);
        const result = await executeQuery(
          `EXEC [dbo].[hht_putaway_update] @serial_no, @put_location, @put_by, @put_warehouse`,
          [
            { name: 'serial_no', type: sql.NVarChar, value: serialNo.trim() },
            { name: 'put_location', type: sql.NVarChar, value: put_location },
            { name: 'put_by', type: sql.NVarChar, value: put_by },
            { name: 'put_warehouse', type: sql.NVarChar, value: put_warehouse },
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
    console.error('Error in hhtPutawayUpdate:', error);
    res.status(500).json({ Status: 'F', Message: 'Internal server error' });
  }
};

export const hhtLocationExists = async (req, res) => {
  try {
    const { warehouse_code, location } = req.body;

    const result = await executeQuery(`EXEC [dbo].[hht_location_exists] @warehouse_code, @location`, [
      { name: 'warehouse_code', type: sql.NVarChar(50), value: warehouse_code },
      { name: 'location', type: sql.NVarChar(50), value: location },
    ]);

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const hhtLocationSuggestion = async (req, res) => {
  try {
    const { warehouse_code } = req.body;

    const result = await executeQuery(`EXEC [dbo].[hht_location_suggestion] @warehouse_code`, [
      { name: 'warehouse_code', type: sql.NVarChar(50), value: warehouse_code },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
