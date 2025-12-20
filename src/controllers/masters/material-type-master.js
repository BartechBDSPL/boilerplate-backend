import { executeQuery } from '../../config/db.js';
import { sql } from '../../config/db.js';

export const insertMaterialType = async (req, res) => {
  const { materialType, createdBy } = req.body;
  console.log(req.body);
  try {
    const insertDetails = await executeQuery(
      'EXEC sp_material_type_master_insert @material_type, @created_by',
      [
        { name: 'material_type', type: sql.NVarChar, value: materialType },
        { name: 'created_by', type: sql.NVarChar, value: createdBy },
      ]
    );
    res.json({
      Status: insertDetails[0].Status,
      Message: insertDetails[0].Message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMaterialType = async (req, res) => {
  const { id, materialType, updatedBy } = req.body;
  console.log(req.body);
  try {
    const updateDetails = await executeQuery(
      'EXEC sp_material_type_master_update @id, @material_type, @updated_by',
      [
        { name: 'id', type: sql.Int, value: id },
        { name: 'material_type', type: sql.NVarChar, value: materialType },
        { name: 'updated_by', type: sql.NVarChar, value: updatedBy },
      ]
    );
    res.json({
      Status: updateDetails[0].Status,
      Message: updateDetails[0].Message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllMaterialTypes = async (req, res) => {
  try {
    const getAllMaterialTypes = await executeQuery('EXEC sp_material_type_master_get_all');
    res.json(getAllMaterialTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};