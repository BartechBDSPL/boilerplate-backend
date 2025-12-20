import { executeQuery, sql } from '../../config/db.js';

export const getQCDetailsReport = async (req, res) => {
  const {
    factory_name,
    category_name,
    sub_category_name,
    model_code,
    model_name,
    model_description,
    qc_status,
    from_date,
    to_date,
  } = req.body;

  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_rep_qc_details] @factory_name, @category_name, @sub_category_name, @model_name, @model_description, @qc_status, @from_date, @to_date`,
      [
        { name: 'factory_name', type: sql.NVarChar, value: factory_name },
        { name: 'category_name', type: sql.NVarChar, value: category_name },
        { name: 'sub_category_name', type: sql.NVarChar, value: sub_category_name },
        { name: 'model_name', type: sql.NVarChar, value: model_name },
        { name: 'model_description', type: sql.NVarChar, value: model_description },
        { name: 'qc_status', type: sql.NVarChar, value: qc_status },
        { name: 'from_date', type: sql.NVarChar, value: from_date },
        { name: 'to_date', type: sql.NVarChar, value: to_date },
      ]
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching QC details report:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};
export const getPutawayDetailsReport = async (req, res) => {
  const { factory_name, category_name, sub_category_name, model_name, model_description, from_date, to_date } =
    req.body;

  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_rep_putaway_details] @factory_name, @category_name, @sub_category_name, @model_name, @model_description, @from_date, @to_date`,
      [
        { name: 'factory_name', type: sql.NVarChar, value: factory_name ? factory_name : '' },
        { name: 'category_name', type: sql.NVarChar, value: category_name ? category_name : '' },
        { name: 'sub_category_name', type: sql.NVarChar, value: sub_category_name ? sub_category_name : '' },
        { name: 'model_name', type: sql.NVarChar, value: model_name ? model_name : '' },
        { name: 'model_description', type: sql.NVarChar, value: model_description ? model_description : '' },
        { name: 'from_date', type: sql.NVarChar, value: from_date },
        { name: 'to_date', type: sql.NVarChar, value: to_date },
      ]
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching putaway details report:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};
export const getReworkReport = async (req, res) => {
  const {
    factory_name,
    category_name,
    sub_category_name,
    model_code,
    model_name,
    model_description,
    from_date,
    to_date,
  } = req.body;
  console.log(req.body);
  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_rep_rework] @factory_name, @category_name, @sub_category_name, @model_name, @model_description, @from_date, @to_date`,
      [
        { name: 'factory_name', type: sql.NVarChar, value: factory_name },
        { name: 'category_name', type: sql.NVarChar, value: category_name },
        { name: 'sub_category_name', type: sql.NVarChar, value: sub_category_name },
        { name: 'model_name', type: sql.NVarChar, value: model_name },
        { name: 'model_description', type: sql.NVarChar, value: model_description },
        { name: 'from_date', type: sql.NVarChar, value: from_date },
        { name: 'to_date', type: sql.NVarChar, value: to_date },
      ]
    );
    const modifiedResult = result.map(item => ({
      ...item,
      image_path: item.image_path ? `/images/qc/${item.image_path}` : null,
    }));
    res.json(modifiedResult);
  } catch (error) {
    console.error('Error fetching rework report:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};

export const getInternalMovementReport = async (req, res) => {
  const { factory_name, category_name, sub_category_name, model_name, model_description, from_date, to_date } =
    req.body;

  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_rep_internal_moevement] @factory_name, @category_name, @sub_category_name, @model_name, @model_description, @from_date, @to_date`,
      [
        { name: 'factory_name', type: sql.NVarChar, value: factory_name },
        { name: 'category_name', type: sql.NVarChar, value: category_name },
        { name: 'sub_category_name', type: sql.NVarChar, value: sub_category_name },
        { name: 'model_name', type: sql.NVarChar, value: model_name },
        { name: 'model_description', type: sql.NVarChar, value: model_description },
        { name: 'from_date', type: sql.NVarChar, value: from_date },
        { name: 'to_date', type: sql.NVarChar, value: to_date },
      ]
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching internal movement report:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};

export const getPickingReport = async (req, res) => {
  const { factory_name, category_name, sub_category_name, model_name, model_description, from_date, to_date } =
    req.body;

  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_rep_picking] @factory_name, @category_name, @sub_category_name, @model_name, @model_description, @from_date, @to_date`,
      [
        { name: 'factory_name', type: sql.NVarChar, value: factory_name },
        { name: 'category_name', type: sql.NVarChar, value: category_name },
        { name: 'sub_category_name', type: sql.NVarChar, value: sub_category_name },
        { name: 'model_name', type: sql.NVarChar, value: model_name },
        { name: 'model_description', type: sql.NVarChar, value: model_description },
        { name: 'from_date', type: sql.NVarChar, value: from_date },
        { name: 'to_date', type: sql.NVarChar, value: to_date },
      ]
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching picking report:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};

export const getFGLabelPrintingReport = async (req, res) => {
  const {
    factory_name,
    category_name,
    sub_category_name,
    model_code,
    model_name,
    model_description,
    from_date,
    to_date,
  } = req.body;
  console.log(req.body);
  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_rep_fg_label_printing] @factory_name, @category_name, @sub_category_name, @model_name, @model_description, @from_date, @to_date`,
      [
        { name: 'factory_name', type: sql.NVarChar, value: factory_name },
        { name: 'category_name', type: sql.NVarChar, value: category_name },
        { name: 'sub_category_name', type: sql.NVarChar, value: sub_category_name },
        { name: 'model_name', type: sql.NVarChar, value: model_name },
        { name: 'model_description', type: sql.NVarChar, value: model_description },
        { name: 'from_date', type: sql.NVarChar, value: from_date },
        { name: 'to_date', type: sql.NVarChar, value: to_date },
      ]
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching FG label printing report:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};

export const getReprintFGLabelReport = async (req, res) => {
  const {
    factory_name,
    category_name,
    sub_category_name,
    model_code,
    model_name,
    model_description,
    from_date,
    to_date,
  } = req.body;

  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_rep_reprint_fg_label] @factory_name, @category_name, @sub_category_name, @model_name, @model_description, @from_date, @to_date`,
      [
        { name: 'factory_name', type: sql.NVarChar, value: factory_name },
        { name: 'category_name', type: sql.NVarChar, value: category_name },
        { name: 'sub_category_name', type: sql.NVarChar, value: sub_category_name },
        { name: 'model_name', type: sql.NVarChar, value: model_name },
        { name: 'model_description', type: sql.NVarChar, value: model_description },
        { name: 'from_date', type: sql.NVarChar, value: from_date },
        { name: 'to_date', type: sql.NVarChar, value: to_date },
      ]
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching reprint FG label report:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};

export const getMaterialAgeingReport = async (req, res) => {
  const { factory_name, category_name, sub_category_name, model_code, model_name, model_description } = req.body;

  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_rep_material_ageging] @factory_name, @category_name, @sub_category_name, @model_name, @model_description`,
      [
        { name: 'factory_name', type: sql.NVarChar, value: factory_name },
        { name: 'category_name', type: sql.NVarChar, value: category_name },
        { name: 'sub_category_name', type: sql.NVarChar, value: sub_category_name },
        { name: 'model_name', type: sql.NVarChar, value: model_name },
        { name: 'model_description', type: sql.NVarChar, value: model_description },
      ]
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching material ageing report:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};

export const getReturnReport = async (req, res) => {
  const { factory_name, category_name, sub_category_name, model_name, model_description, from_date, to_date } =
    req.body;

  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_rep_return] @factory_name, @category_name, @sub_category_name, @model_name, @model_description, @from_date, @to_date`,
      [
        { name: 'factory_name', type: sql.NVarChar, value: factory_name },
        { name: 'category_name', type: sql.NVarChar, value: category_name },
        { name: 'sub_category_name', type: sql.NVarChar, value: sub_category_name },
        { name: 'model_name', type: sql.NVarChar, value: model_name },
        { name: 'model_description', type: sql.NVarChar, value: model_description },
        { name: 'from_date', type: sql.NVarChar, value: from_date },
        { name: 'to_date', type: sql.NVarChar, value: to_date },
      ]
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching return report:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};

export const getLiveStockReport = async (req, res) => {
  try {
    const result = await executeQuery(`EXEC [dbo].[sp_rep_live_stock]`);
    res.json(result);
  } catch (error) {
    console.error('Error fetching live stock report:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};
