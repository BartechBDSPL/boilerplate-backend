import { executeQuery } from '../../config/db.js';
import { sql } from '../../config/db.js';

export const validateSerialNo = async (req, res) => {
  const { serial_no } = req.body;

  try {
    const result = await executeQuery('EXEC hht_oem_inward_validation @serial_no', [
      { name: 'serial_no', type: sql.NVarChar, value: serial_no },
    ]);
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateInward = async (req, res) => {
  const {
    sub_category_name,
    category_name,
    model_name,
    model_description,
    serial_no,
    put_warehouse,
    put_location,
    warranty,
    created_by,
  } = req.body;
  try {
    console.log(req.body);
    const serialNos = serial_no.split('$');
    const results = [];
    for (const sn of serialNos) {
      const result = await executeQuery(
        'EXEC hht_oem_inward_update @category_name, @sub_category_name, @model_name, @model_description, @serial_no, @put_warehouse, @put_location, @warranty, @created_by',
        [
          { name: 'category_name', type: sql.NVarChar, value: category_name.trim() },
          { name: 'sub_category_name', type: sql.NVarChar, value: sub_category_name.trim() },
          { name: 'model_name', type: sql.NVarChar, value: model_name.trim() },
          { name: 'model_description', type: sql.NVarChar, value: model_description.trim() },
          { name: 'serial_no', type: sql.NVarChar, value: sn.trim() },
          { name: 'put_warehouse', type: sql.NVarChar, value: put_warehouse.trim() },
          { name: 'put_location', type: sql.NVarChar, value: put_location.trim() },
          { name: 'warranty', type: sql.Int, value: parseInt(warranty.trim(), 10) },
          { name: 'created_by', type: sql.NVarChar, value: created_by.trim() },
        ]
      );
      results.push(result[0]);
    }
    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getPartyNames = async (req, res) => {
  try {
    const result = await executeQuery('EXEC hht_oem_party_name_get_all');
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryNames = async (req, res) => {
  const { party_name } = req.body;
  try {
    const result = await executeQuery('EXEC hht_oem_category_name_get_all @party_name', [
      { name: 'party_name', type: sql.NVarChar, value: party_name },
    ]);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getModelNames = async (req, res) => {
  const { party_name, category_name } = req.body;
  try {
    const result = await executeQuery('EXEC hht_oem_model_name_get_all @party_name, @category_name', [
      { name: 'party_name', type: sql.NVarChar, value: party_name },
      { name: 'category_name', type: sql.NVarChar, value: category_name },
    ]);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
