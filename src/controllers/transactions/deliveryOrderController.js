import { executeQuery, sql } from '../../config/db.js';

export const generateDeliveryOrderNo = async (req, res) => {
  try {
    const result = await executeQuery(`EXEC [dbo].[sp_delivery_order_generate_no]`, []);

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getModelWiseQuantity = async (req, res) => {
  try {
    const { model_code, model_name } = req.body;

    const result = await executeQuery(`EXEC [dbo].[sp_model_wise_quantity] @model_code, @model_name`, [
      { name: 'model_code', type: sql.NVarChar(2), value: model_code === '' ? '' : model_code.padStart(2, '0') },
      { name: 'model_name', type: sql.NVarChar(50), value: model_name },
    ]);

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const insertDeliveryOrderRequest = async (req, res) => {
  try {
    const generateResult = await executeQuery(`EXEC [dbo].[sp_delivery_order_generate_no]`, []);
    const deliveryNumber = generateResult[0].delivery_order_no;

    const {
      model_code,
      model_name,
      model_description,
      quantity,
      assigned_user,
      truck_number,
      driver_name,
      customer_name,
      created_by,
    } = req.body;

    const modelCodes = model_code.split('$');
    const modelNames = model_name.split('$');
    const modelDescriptions = model_description.split('$');
    const quantities = quantity.split('$').map(q => parseInt(q, 10));

    const numItems = modelCodes.length;
    const insertedItems = [];

    for (let i = 0; i < numItems; i++) {
      const result = await executeQuery(
        `EXEC [dbo].[sp_delivery_order_request_insert] @delivery_number, @model_code, @model_name, @model_description, @quantity, @assigned_user, @truck_number, @driver_name, @customer_name, @created_by`,
        [
          { name: 'delivery_number', type: sql.NVarChar(50), value: deliveryNumber },
          { name: 'model_code', type: sql.NVarChar(2), value: modelCodes[i] },
          { name: 'model_name', type: sql.NVarChar(50), value: modelNames[i] },
          { name: 'model_description', type: sql.NVarChar(150), value: modelDescriptions[i] },
          { name: 'quantity', type: sql.Int, value: quantities[i] },
          { name: 'assigned_user', type: sql.NVarChar(200), value: assigned_user },
          { name: 'truck_number', type: sql.NVarChar(50), value: truck_number },
          { name: 'driver_name', type: sql.NVarChar(50), value: driver_name },
          { name: 'customer_name', type: sql.NVarChar(100), value: customer_name },
          { name: 'created_by', type: sql.NVarChar(50), value: created_by },
        ]
      );

      insertedItems.push(result[0]);
    }

    res.status(200).json({ insertedItems, OrderNumber: deliveryNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateDeliveryOrderRequest = async (req, res) => {
  try {
    const {
      id,
      delivery_number,
      model_code,
      model_name,
      model_description,
      quantity,
      assigned_user,
      truck_number,
      driver_name,
      customer_name,
      updated_by,
    } = req.body;

    const ids = id.split('$').map(i => parseInt(i, 10));
    const modelCodes = model_code.split('$');
    const modelNames = model_name.split('$');
    const modelDescriptions = model_description.split('$');
    const quantities = quantity.split('$').map(q => parseInt(q, 10));

    const numItems = ids.length;

    for (let i = 0; i < numItems; i++) {
      const result = await executeQuery(
        `EXEC [dbo].[sp_delivery_order_request_update] @id, @delivery_number, @model_code, @model_name, @model_description, @quantity, @assigned_user, @truck_number, @driver_name, @customer_name, @updated_by`,
        [
          { name: 'id', type: sql.Int, value: ids[i] },
          { name: 'delivery_number', type: sql.NVarChar(50), value: delivery_number },
          { name: 'model_code', type: sql.NVarChar(2), value: modelCodes[i] },
          { name: 'model_name', type: sql.NVarChar(50), value: modelNames[i] },
          { name: 'model_description', type: sql.NVarChar(150), value: modelDescriptions[i] },
          { name: 'quantity', type: sql.Int, value: quantities[i] },
          { name: 'assigned_user', type: sql.NVarChar(200), value: assigned_user },
          { name: 'truck_number', type: sql.NVarChar(50), value: truck_number },
          { name: 'driver_name', type: sql.NVarChar(50), value: driver_name },
          { name: 'customer_name', type: sql.NVarChar(100), value: customer_name },
          { name: 'updated_by', type: sql.NVarChar(50), value: updated_by },
        ]
      );

      if (result && result.length > 0 && result[0].Status === 'F') {
        return res.status(400).json({ Status: 'F', Message: result[0].Message || 'Update failed' });
      }
    }

    res.status(200).json({ Status: 'T', Message: 'Delivery order updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Status: 'E', Message: error.message });
  }
};

export const getRecentDeliveryOrderDetails = async (req, res) => {
  try {
    const result = await executeQuery(`EXEC [dbo].[sp_delivery_order_request_get_recent_details]`, []);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const result = await executeQuery(`EXEC [dbo].[sp_user_master_get_users]`, []);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
