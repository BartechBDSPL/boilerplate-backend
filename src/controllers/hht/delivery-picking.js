import { executeQuery, sql } from '../../config/db.js';

export const getDeliveryOrders = async (req, res) => {
  try {
    const { assign_user } = req.body;

    const result = await executeQuery(`EXEC [dbo].[hht_delivery_orders] @assign_user`, [
      { name: 'assign_user', type: sql.NVarChar(50), value: assign_user },
    ]);
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getDeliveryOrderDetails = async (req, res) => {
  try {
    const { delivery_number, model_name, picked_status } = req.body;

    const result = await executeQuery(
      `EXEC [dbo].[hht_delivery_order_details] @delivery_number , @model_name, @picked_status`,
      [
        { name: 'delivery_number', type: sql.NVarChar(50), value: delivery_number },
        { name: 'model_name', type: sql.NVarChar(50), value: model_name },
        { name: 'picked_status', type: sql.NVarChar(50), value: picked_status },
      ]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const hhtPickValidation = async (req, res) => {
  try {
    const { serial_no, model_name } = req.body;

    const result = await executeQuery(`EXEC [dbo].[hht_pick_validation] @serial_no, @model_name`, [
      { name: 'serial_no', type: sql.NVarChar(255), value: serial_no },
      { name: 'model_name', type: sql.NVarChar(50), value: model_name },
    ]);

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const hhtPickUpdate = async (req, res) => {
  try {
    const { delivery_number, model_name, serial_no, quantity, pick_by } = req.body;

    const result = await executeQuery(
      `EXEC [dbo].[hht_pick_update] @delivery_number, @model_name, @serial_no, @quantity, @pick_by`,
      [
        { name: 'delivery_number', type: sql.NVarChar(50), value: delivery_number },
        { name: 'model_name', type: sql.NVarChar(50), value: model_name },
        { name: 'serial_no', type: sql.NVarChar(255), value: serial_no },
        { name: 'quantity', type: sql.Int, value: quantity },
        { name: 'pick_by', type: sql.NVarChar(50), value: pick_by },
      ]
    );

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const hhtPickSerialNoDetails = async (req, res) => {
  try {
    const { model_name } = req.body;

    const result = await executeQuery(`EXEC [dbo].[hht_pick_serialno_details] @model_name`, [
      { name: 'model_name', type: sql.NVarChar(50), value: model_name },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const hhtPickRecentDetails = async (req, res) => {
  try {
    const { delivery_number, model_name } = req.body;
    console.log(delivery_number, model_name);
    const result = await executeQuery(`EXEC [dbo].[hht_pick_recent_details] @delivery_number, @model_name`, [
      { name: 'delivery_number', type: sql.NVarChar(50), value: delivery_number },
      { name: 'model_name', type: sql.NVarChar(50), value: model_name },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const hhtPickReversal = async (req, res) => {
  try {
    const { delivery_number, serial_no, model_name, reverse_by } = req.body;

    const result = await executeQuery(
      `EXEC [dbo].[hht_pick_reversal] @delivery_number, @serial_no, @model_name, @reverse_by`,
      [
        { name: 'delivery_number', type: sql.NVarChar(50), value: delivery_number },
        { name: 'serial_no', type: sql.NVarChar(255), value: serial_no },
        { name: 'model_name', type: sql.NVarChar(50), value: model_name },
        { name: 'reverse_by', type: sql.NVarChar(50), value: reverse_by },
      ]
    );

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const hhtPickManualClosing = async (req, res) => {
  try {
    const { delivery_number, model_name } = req.body;

    const result = await executeQuery(`EXEC [dbo].[hht_pick_manual_closing] @delivery_number, @model_name`, [
      { name: 'delivery_number', type: sql.NVarChar(50), value: delivery_number },
      { name: 'model_name', type: sql.NVarChar(50), value: model_name },
    ]);

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
