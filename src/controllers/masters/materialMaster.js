import { executeQuery } from '../../config/db.js';
import { sql } from '../../config/db.js';

export const getAllMaterialDetails = async (req, res) => {
  try {
    const result = await executeQuery(`EXEC sp_material_master_get_all_details`);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getAllMaterialCode = async (req, res) => {
  try {
    const result = await executeQuery(`SELECT material_code FROM material_master ORDER BY material_code ASC`);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const insertMaterialDetails = async (req, res) => {
  const { material_code, material_description, material_type, material_status, created_by } = req.body;

  try {
    const result = await executeQuery(
      'EXEC sp_material_master_insert @material_code, @material_description, @material_type, @material_status, @created_by',
      [
        { name: 'material_code', type: sql.NVarChar, value: material_code },
        { name: 'material_description', type: sql.NVarChar, value: material_description },
        { name: 'material_type', type: sql.NVarChar, value: material_type },
        { name: 'material_status', type: sql.NVarChar, value: material_status },
        { name: 'created_by', type: sql.NVarChar, value: created_by },
      ]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMaterialDetails = async (req, res) => {
  const { id, material_code, material_description, material_type, material_status, updated_by } = req.body;

  try {
    const result = await executeQuery(
      'EXEC sp_material_master_update @id, @material_code, @material_description, @material_type, @material_status, @updated_by',
      [
        { name: 'id', type: sql.Int, value: id },
        { name: 'material_code', type: sql.NVarChar, value: material_code },
        { name: 'material_description', type: sql.NVarChar, value: material_description },
        { name: 'material_type', type: sql.NVarChar, value: material_type },
        { name: 'material_status', type: sql.NVarChar, value: material_status },
        { name: 'updated_by', type: sql.NVarChar, value: updated_by },
      ]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
