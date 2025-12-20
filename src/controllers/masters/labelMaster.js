import { executeQuery } from '../../config/db.js';
import { sql } from '../../config/db.js';

export const getAllLabelMaster = async (req, res) => {
  try {
    const result = await executeQuery('EXEC [dbo].[sp_label_master_get_all_details]');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const insertLabelMaster = async (req, res) => {
  const {
    label_name,
    prn_file_name,
    company_name,
    company_address_1,
    company_address_2,
    email,
    customer_care_no,
    make,
    created_by,
  } = req.body;

  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_label_master_insert] 
       @label_name, @prn_file_name, @company_name, @company_address_1, 
       @company_address_2, @email, @customer_care_no, @make, @created_by`,
      {
        label_name: { type: sql.NVarChar(50), value: label_name },
        prn_file_name: { type: sql.NVarChar(100), value: prn_file_name },
        company_name: { type: sql.NVarChar(50), value: company_name },
        company_address_1: { type: sql.NVarChar(100), value: company_address_1 },
        company_address_2: { type: sql.NVarChar(100), value: company_address_2 },
        email: { type: sql.NVarChar(50), value: email },
        customer_care_no: { type: sql.NVarChar(20), value: customer_care_no },
        make: { type: sql.NVarChar(100), value: make },
        created_by: { type: sql.NVarChar(50), value: created_by },
      }
    );
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLabelMaster = async (req, res) => {
  const {
    id,
    label_name,
    prn_file_name,
    company_name,
    company_address_1,
    company_address_2,
    email,
    customer_care_no,
    make,
    updated_by,
  } = req.body;

  try {
    const result = await executeQuery(
      `EXEC [dbo].[sp_label_master_update] 
       @id, @label_name, @prn_file_name, @company_name, @company_address_1, 
       @company_address_2, @email, @customer_care_no, @make, @updated_by`,
      {
        id: { type: sql.Int, value: id },
        label_name: { type: sql.NVarChar(50), value: label_name },
        prn_file_name: { type: sql.NVarChar(100), value: prn_file_name },
        company_name: { type: sql.NVarChar(50), value: company_name },
        company_address_1: { type: sql.NVarChar(100), value: company_address_1 },
        company_address_2: { type: sql.NVarChar(100), value: company_address_2 },
        email: { type: sql.NVarChar(50), value: email },
        customer_care_no: { type: sql.NVarChar(20), value: customer_care_no },
        make: { type: sql.NVarChar(100), value: make },
        updated_by: { type: sql.NVarChar(50), value: updated_by },
      }
    );
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
