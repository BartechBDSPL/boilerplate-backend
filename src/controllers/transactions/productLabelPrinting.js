import { executeQuery, sql } from '../../config/db.js';

export const getActiveProductionOrdersByAssignedLine = async (req, res) => {
  const { assigned_line } = req.body;

  if (!assigned_line) {
    return res.json({
      Status: 'F',
      Message: 'assigned_line is required',
      data: null,
    });
  }

  try {
    const result = await executeQuery(
      'EXEC sp_get_active_production_orders_by_assigned_line @assigned_line',
      [{ name: 'assigned_line', type: sql.NVarChar, value: assigned_line }]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getActiveProductionOrdersByAssignedLine:', error);
    res.status(500).json({
      Status: 'F',
      Message: error.message,
      data: null,
    });
  }
};

export const getUnprintedLabels = async (req, res) => {
  const { order_number } = req.body;

  if (!order_number) {
    return res.json({
      Status: 'F',
      Message: 'order_number is required',
      data: null,
    });
  }

  try {
    const result = await executeQuery(
      'EXEC sp_get_unprinted_labels @order_number',
      [{ name: 'order_number', type: sql.NVarChar, value: order_number }]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getUnprintedLabels:', error);
    res.status(500).json({
      Status: 'F',
      Message: error.message,
      data: null,
    });
  }
};

export const updateLabelPrintingPrintStatus = async (req, res) => {
  const { serial_no, print_by, isLast, order_number } = req.body;

  if (!serial_no || !print_by) {
    return res.json({
      Status: 'F',
      Message: 'serial_no and print_by are required',
      data: null,
    });
  }

  try {
    const result = await executeQuery(
      'EXEC sp_label_printing_print_by_print_date_update @serial_no, @print_by',
      [
        { name: 'serial_no', type: sql.NVarChar, value: serial_no },
        { name: 'print_by', type: sql.NVarChar, value: print_by }
      ]
    );

    if (result[0].Status === 'T' && isLast) {
      await executeQuery(
        'EXEC sp_production_order_end_date_update @order_number',
        [{ name: 'order_number', type: sql.NVarChar, value: order_number }]
      );
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error in updateLabelPrintingPrintStatus:', error);
    res.status(500).json({
      Status: 'F',
      Message: error.message,
      data: null,
    });
  }
};