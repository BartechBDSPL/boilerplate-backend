import { executeQuery, sql } from '../../config/db.js';
import { formatDateTimeGMT } from '../../utils/dateTime.js';

export async function warrantyStatus(req, res) {
  const { serial_no } = req.body;

  if (!serial_no) {
    return res.status(400).json({ Status: 'F', Message: 'Serial number is required.' });
  }

  try {
    const result = await executeQuery('EXEC sp_warranty_status @serial_no', [
      { name: 'serial_no', type: sql.NVarChar, value: serial_no },
    ]);
    console.log(result);
    if (result && result.length > 0) {
      const data = result[0];
      console.log(data);
      if (data.Status === 'F') {
        return res.json(data);
      }

      if (data.image_path) {
        if (Array.isArray(data.image_path)) {
          data.image_path = data.image_path[0] ? `/images/qc/${data.image_path[0]}` : null;
        } else if (typeof data.image_path === 'string' && data.image_path.trim() !== '') {
          data.image_path = `/images/qc/${data.image_path}`;
        } else {
          data.image_path = null;
        }
      } else {
        data.image_path = null;
      }

      const warrantyMonths = data.warranty || 0;
      const dispatchDate = data.pick_date ? new Date(data.pick_date) : null;
      const warrantyExpiryDate = dispatchDate ? new Date(dispatchDate) : null;
      if (warrantyExpiryDate) {
        warrantyExpiryDate.setMonth(warrantyExpiryDate.getMonth() + warrantyMonths);
      }

      const currentDate = new Date();
      const remainingDays = warrantyExpiryDate
        ? Math.max(0, Math.ceil((warrantyExpiryDate - currentDate) / (1000 * 60 * 60 * 24)))
        : 0;
      const isWarrantyActive = warrantyExpiryDate ? currentDate <= warrantyExpiryDate : false;

      const enhancedData = {
        ...data,

        qc_date: data.qc_date ? formatDateTimeGMT(new Date(data.qc_date).toISOString()) : null,
        rework_date: data.rework_date ? formatDateTimeGMT(new Date(data.rework_date).toISOString()) : null,
        put_date: data.put_date ? formatDateTimeGMT(new Date(data.put_date).toISOString()) : null,
        pick_date: data.pick_date ? formatDateTimeGMT(new Date(data.pick_date).toISOString()) : null,

        dispatch_date: data.pick_date ? formatDateTimeGMT(new Date(data.pick_date).toISOString()) : null,
        dispatch_by: data.pick_by,
        warranty_months: warrantyMonths,
        warranty_start_date: dispatchDate ? dispatchDate.toLocaleDateString() : null,
        warranty_expiry_date: warrantyExpiryDate ? warrantyExpiryDate.toLocaleDateString() : null,
        warranty_remaining_days: remainingDays,
        warranty_status: isWarrantyActive ? 'Active' : 'Expired',
        product_status: 'Dispatched',

        qc_completed: data.qc_status ? true : false,
        rework_completed: data.rework_status === 'Y',
        putaway_completed: data.put_status === 'Y',
        picking_completed: data.pick_status === 'Y',
      };
      console.log(enhancedData);
      return res.json(enhancedData);
    } else {
      return res.status(404).json({ Status: 'F', Message: 'No data found.' });
    }
  } catch (error) {
    console.error('Error executing warranty status query:', error);
    res.status(500).json({ Status: 'E', Message: error.message });
  }
}

export async function warrantyValidation(req, res) {
  const { serial_no } = req.body;

  if (!serial_no) {
    return res.status(400).json({ Status: 'F', Message: 'Serial number is required.' });
  }

  try {
    const result = await executeQuery('EXEC sp_warranty_validation @serial_no', [
      { name: 'serial_no', type: sql.NVarChar(255), value: serial_no?.trim() },
    ]);

    if (result && result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ Status: 'F', Message: 'No data found.' });
    }
  } catch (error) {
    console.error('Error in warranty validation:', error);
    res.status(500).json({ Status: 'E', Message: error.message });
  }
}

export async function warrantyUpdate(req, res) {
  const { serial_no, warranty, done_by } = req.body;

  if (!serial_no || warranty === undefined) {
    return res.status(400).json({ Status: 'F', Message: 'Serial number and warranty are required.' });
  }

  try {
    const result = await executeQuery('EXEC sp_warranty_update @serial_no, @warranty, @done_by', [
      { name: 'serial_no', type: sql.NVarChar(255), value: serial_no?.trim() },
      { name: 'warranty', type: sql.Int, value: warranty },
      { name: 'done_by', type: sql.NVarChar(255), value: done_by?.trim() },
    ]);

    if (result && result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(500).json({ Status: 'F', Message: 'Update failed.' });
    }
  } catch (error) {
    console.error('Error in warranty update:', error);
    res.status(500).json({ Status: 'E', Message: error.message });
  }
}
