import { executeQuery } from '../../config/db.js';
import { sql } from '../../config/db.js';
import { encryptPassword } from '../../utils/passswordHelper.js';

export const getAllUserDetails = async (req, res) => {
  try {
    const result = await executeQuery('EXEC [dbo].[sp_user_get_all_details]');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserDetails = async (req, res) => {
  // Accept snake_case for this endpoint
  const {
    id,
    user_name,
    user_role,
    user_status,
    locked,
    updated_by,
    pass_exp_days,
    plant_code,
    line_no,
    email_id,
    mobile_no,
    warehouse_code,
  } = req.body;

  try {
    const result = await executeQuery(
      'EXEC [dbo].[sp_user_update] @id, @user_role, @user_status, @locked, @updated_by, @user_name, @plant_code, @line_no, @email_id, @mobile_no, @pass_exp_days',
      {
        id: { type: sql.Int, value: parseInt(id) },
        user_role: { type: sql.NVarChar(150), value: user_role },
        user_status: { type: sql.NVarChar(150), value: user_status },
        locked: { type: sql.NVarChar(150), value: locked },
        updated_by: { type: sql.NVarChar(150), value: updated_by },
        user_name: { type: sql.NVarChar(150), value: user_name },
        plant_code: { type: sql.NVarChar(150), value: plant_code },
        line_no: { type: sql.NVarChar(10), value: line_no },
        email_id: { type: sql.NVarChar(150), value: email_id },
        mobile_no: { type: sql.BigInt, value: mobile_no ? parseInt(mobile_no) : null },
        pass_exp_days: { type: sql.Int, value: pass_exp_days ? parseInt(pass_exp_days) : null },
      }
    );
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUserTypeDD = async (req, res) => {
  try {
    const result = await executeQuery('EXEC [dbo].[sp_get_all_user_type]');

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const insertUserDetails = async (req, res) => {
  const {
    user_id,
    user_name,
    user_password,
    user_role,
    user_status,
    locked,
    created_by,
    pass_exp_days,
    login_attempt,
    name,
    plant_code,
    line_no,
    email_id,
    warehouse_code,
    mobile_no,
    is_change_password,
  } = req.body;
  console.log(req.body);
  try {
    const result = await executeQuery(
      'EXEC [dbo].[sp_user_insert] @user_id, @user_name, @user_password, @user_role, @user_status, @locked, @created_by, @pass_exp_days, @login_attempt, @name, @plant_code, @line_no, @email_id, @mobile_no, @is_change_password',
      {
        user_id: { type: sql.NVarChar(150), value: user_id },
        user_name: { type: sql.NVarChar(150), value: user_name },
        user_password: {
          type: sql.NVarChar(150),
          value: encryptPassword(user_password.toString()),
        },
        user_role: { type: sql.NVarChar(150), value: user_role },
        user_status: { type: sql.NVarChar(150), value: user_status },
        locked: { type: sql.NVarChar(150), value: locked },
        created_by: { type: sql.NVarChar(150), value: created_by },
        pass_exp_days: { type: sql.Int, value: parseInt(pass_exp_days) },
        login_attempt: { type: sql.Int, value: parseInt(login_attempt) },
        name: { type: sql.NVarChar(150), value: name },
        plant_code: { type: sql.NVarChar(150), value: plant_code },
        line_no: { type: sql.NVarChar(10), value: line_no },
        email_id: { type: sql.NVarChar(150), value: email_id },
        mobile_no: { type: sql.BigInt, value: parseInt(mobile_no) },
        is_change_password: {
          type: sql.Bit,
          value: is_change_password === true ? 1 : 0,
        },
      }
    );

    res.status(200).json(result[0]);
  } catch (error) {
    if (error.message.includes('User ID already exists')) {
      res.status(400).json({ error: 'User ID already exists in User Master.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};
