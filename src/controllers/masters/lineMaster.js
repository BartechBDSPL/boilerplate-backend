import { executeQuery } from '../../config/db.js';
import { sql } from '../../config/db.js';

export const getAllLineMaster = async (req, res) => {
  try {
    const result = await executeQuery('EXEC [dbo].[sp_line_master_get_all_details]');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const insertLineMaster = async (req, res) => {
  const {
    plant_name, plant,
    line_no, lineCode,
    line_name, lineDesc,
    line_ip, lineIP,
    line_status, lineStatus,
    created_by, user,
  } = req.body;

  const payload = {
    plant_name: plant_name || plant || null,
    line_no: line_no || lineCode || null,
    line_name: line_name || lineDesc || null,
    line_ip: line_ip || lineIP || null,
    line_status: (line_status || lineStatus || 'Active'),
    created_by: created_by || user || null,
  };

  try {
    const result = await executeQuery(
      'EXEC [dbo].[sp_line_master_insert] @plant_name, @line_no, @line_name, @line_ip, @line_status, @created_by',
      {
        plant_name: { type: sql.NVarChar(50), value: payload.plant_name },
        line_no: { type: sql.NVarChar(10), value: payload.line_no },
        line_name: { type: sql.NVarChar(50), value: payload.line_name },
        line_ip: { type: sql.NVarChar(20), value: payload.line_ip },
        line_status: { type: sql.NVarChar(10), value: payload.line_status },
        created_by: { type: sql.NVarChar(50), value: payload.created_by },
      }
    );

    // Stored procedure returns Status and Message rows
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateLineMaster = async (req, res) => {
  // Accept both snake_case and camelCase input
  const {
    id,
    plant_name, plant,
    line_no, lineCode,
    line_name, lineDesc,
    line_ip, lineIP,
    line_status, lineStatus,
    updated_by, user,
  } = req.body;

  const payload = {
    id: id,
    plant_name: plant_name || plant || null,
    line_no: line_no || lineCode || null,
    line_name: line_name || lineDesc || null,
    line_ip: line_ip || lineIP || null,
    line_status: (line_status || lineStatus || 'Active'),
    updated_by: updated_by || user || null,
  };

  try {
    const result = await executeQuery(
      'EXEC [dbo].[sp_line_master_update] @id, @plant_name, @line_no, @line_name, @line_ip, @line_status, @updated_by',
      {
        id: { type: sql.Int, value: payload.id },
        plant_name: { type: sql.NVarChar(50), value: payload.plant_name },
        line_no: { type: sql.NVarChar(10), value: payload.line_no },
        line_name: { type: sql.NVarChar(50), value: payload.line_name },
        line_ip: { type: sql.NVarChar(20), value: payload.line_ip },
        line_status: { type: sql.NVarChar(10), value: payload.line_status },
        updated_by: { type: sql.NVarChar(50), value: payload.updated_by },
      }
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlantName = async (req, res) => {
  const { plant_name, plant } = req.body;
  const plantName = plant_name || plant;

  try {
    const result = await executeQuery(
      'EXEC [dbo].[sp_line_master_get_line_name] @plant_name',
      {
        plant_name: { type: sql.NVarChar(50), value: plantName },
      }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActiveLineDetails = async (req, res) => {
  try {
    const result = await executeQuery('EXEC [dbo].[getActiveLineDetails]');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
