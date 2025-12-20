import { executeQuery, sql } from '../../config/db.js';

export const hhtReturnValidation = async (req, res) => {
  const { serial_no } = req.body;

  if (!serial_no) {
    return res.status(400).json({ Status: 'F', Message: 'Serial number is required.' });
  }

  try {
    const result = await executeQuery('EXEC hht_return_validation @serial_no', [
      { name: 'serial_no', type: sql.NVarChar, value: serial_no },
    ]);

    return res.json(result[0]);
  } catch (error) {
    console.error('Error executing return validation:', error);
    res.status(500).json({ Status: 'E', Message: error.message });
  }
};

export const hhtReturnUpdate = async (req, res) => {
  const { delivery_number, model_name, serial_no, return_by } = req.body;

  if (!delivery_number || !model_name || !serial_no) {
    return res.status(400).json({
      Status: 'F',
      Message: 'Delivery number, model name, and serial number are required.',
    });
  }

  const serialNoSplitted = serial_no.split('$');
  const modelNameSplitted = model_name.split('$');
  const delivery_numberSplitted = delivery_number.split('$');
  let finalResult = { Status: 'T', Message: 'Return processed successfully' };

  try {
    for (let i = 0; i < serialNoSplitted.length; i++) {
      if (serialNoSplitted[i].trim()) {
        const result = await executeQuery(
          'EXEC hht_return_update @delivery_number, @model_name, @serial_no, @return_by',
          [
            { name: 'delivery_number', type: sql.NVarChar(50), value: delivery_numberSplitted[i] },
            { name: 'model_name', type: sql.NVarChar(50), value: modelNameSplitted[i] },
            { name: 'serial_no', type: sql.NVarChar, value: serialNoSplitted[i].trim() },
            { name: 'return_by', type: sql.NVarChar(50), value: return_by },
          ]
        );

        if (result && result.length > 0) {
          if (result[0].Status === 'F') {
            return res.status(500).json(result[0]);
          }
          finalResult = result[0];
        } else {
          return res.status(500).json({ Status: 'F', Message: 'Unexpected error' });
        }
      }
    }

    return res.json(finalResult);
  } catch (error) {
    console.error('Error executing return update:', error);
    return res.status(500).json({ Status: 'E', Message: error.message });
  }
};
