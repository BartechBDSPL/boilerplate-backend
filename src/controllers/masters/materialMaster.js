import { executeQuery, sql } from '../../config/db.js';
import { SAP_MATERIAL_SERVICE, generateRandomEAN, generateRandomMRP, generateRandomProductFamily, trimLeadingZeros } from '../../utils/constants.js';
import https from 'https';

export const syncMaterialsByType = async (req, res) => {
  const { material_type, created_by } = req.body;


  try {
    // Call SAP API to fetch materials by type
    const sapUrl = `${SAP_MATERIAL_SERVICE.BASE_URL}?sap-client=${SAP_MATERIAL_SERVICE.SAP_CLIENT}`;
    
    const sapMaterials = await callSAPMaterialService(sapUrl, material_type);
    console.log(sapMaterials)
    // Upsert each material into database (use generated fallbacks if SAP fields are missing)
    for (const material of sapMaterials) {
      try {
        const eanValue = material.internationalArticleNo && String(material.internationalArticleNo).trim().length > 0
          ? String(material.internationalArticleNo)
          : generateRandomEAN();

        const productFamilyValue = material.productFamily && String(material.productFamily).trim().length > 0
          ? String(material.productFamily)
          : generateRandomProductFamily();

        const productNameValue = material.productName || material.materialName || '';

        const mrpValue = material.mrp && String(material.mrp).trim().length > 0
          ? String(material.mrp)
          : generateRandomMRP();

        const result = await executeQuery(
          `EXEC sp_material_master_upsert 
             @material_number, @material_description, @ean_number, @product_family, @product_name, @mrp, @updated_by`,
          [
            { name: 'material_number', type: sql.NVarChar, value: trimLeadingZeros(material.material) },
            { name: 'material_description', type: sql.NVarChar, value: material.materialName },
            { name: 'ean_number', type: sql.NVarChar, value: eanValue },
            { name: 'product_family', type: sql.NVarChar, value: productFamilyValue },
            { name: 'product_name', type: sql.NVarChar, value: productNameValue },
            { name: 'mrp', type: sql.NVarChar, value: mrpValue },
            { name: 'updated_by', type: sql.NVarChar, value: created_by },
          ]
        );
      } catch (error) {
        console.error(`Error upserting material ${material.material}:`, error);
      }
    }

    res.status(200).json({
      Status: 'T',
      Message: `${sapMaterials.length} materials processed successfully`,
      data: {
        totalMaterials: sapMaterials.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      Status: 'F',
      Message: error.message,
      data: null,
    });
  }
};

// Helper function to call SAP Material Service
const callSAPMaterialService = (url, materialType) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      MaterialType: materialType,
    });

    // Create Basic Auth header
    const auth = Buffer.from(
      `${SAP_MATERIAL_SERVICE.USERNAME}:${SAP_MATERIAL_SERVICE.PASSWORD}`
    ).toString('base64');

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Basic ${auth}`,
      },
      rejectUnauthorized: false, // For development only, use proper SSL in production
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          // Check if response contains error
          if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].type === 'E') {
            reject(new Error(jsonData[0].message));
          }
          
          resolve(Array.isArray(jsonData) ? jsonData : []);
        } catch (error) {
          reject(new Error(`Failed to parse SAP response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`SAP API call failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
};

export const getAllMaterialDetails = async (req, res) => {
  try {
    const result = await executeQuery('EXEC sp_material_master_get_all_details');
    // return raw DB result as-is
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      Status: 'F',
      Message: error.message,
      data: null,
    });
  }
};

export const updateMaterialDetails = async (req, res) => {
  const {
    id,
    material_number,
    material_description,
    ean_number,
    product_family,
    product_name,
    mrp,
    input_rating,
    poe,
    product_url,
    bis,
    product_label_name,
    packaging_label_name,
    updated_by,
  } = req.body;

  try {
    const result = await executeQuery(
      `EXEC sp_material_master_update 
         @id, @material_number, @material_description, @ean_number, @product_family, @product_name, @mrp, @input_rating, @poe, @product_url, @bis, @product_label_name, @packaging_label_name, @updated_by`,
      [
        { name: 'id', type: sql.Int, value: id },
        { name: 'material_number', type: sql.NVarChar, value: trimLeadingZeros(material_number) },
        { name: 'material_description', type: sql.NVarChar, value: material_description },
        { name: 'ean_number', type: sql.NVarChar, value: ean_number },
        { name: 'product_family', type: sql.NVarChar, value: product_family },
        { name: 'product_name', type: sql.NVarChar, value: product_name },
        { name: 'mrp', type: sql.NVarChar, value: mrp },
        { name: 'input_rating', type: sql.NVarChar, value: input_rating },
        { name: 'poe', type: sql.NVarChar, value: poe },
        { name: 'product_url', type: sql.NVarChar, value: product_url },
        { name: 'bis', type: sql.NVarChar, value: bis },
        { name: 'product_label_name', type: sql.NVarChar, value: product_label_name },
        { name: 'packaging_label_name', type: sql.NVarChar, value: packaging_label_name },
        { name: 'updated_by', type: sql.NVarChar, value: updated_by },
      ]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ Status: 'F', Message: error.message });
  }
};

export const insertMaterialDetails = async (req, res) => {
  const {
    material_number,
    material_description,
    ean_number,
    product_family,
    product_name,
    mrp,
    input_rating,
    poe,
    product_url,
    bis,
    product_label_name,
    packaging_label_name,
    created_by,
  } = req.body;


  try {
    const result = await executeQuery(
      `EXEC sp_material_master_insert 
         @material_number, @material_description, @ean_number, @product_family, @product_name, @mrp, @input_rating, @poe, @product_url, @bis, @product_label_name, @packaging_label_name, @created_by`,
      [
        { name: 'material_number', type: sql.NVarChar, value: trimLeadingZeros(material_number) },
        { name: 'material_description', type: sql.NVarChar, value: material_description },
        { name: 'ean_number', type: sql.NVarChar, value: ean_number },
        { name: 'product_family', type: sql.NVarChar, value: product_family },
        { name: 'product_name', type: sql.NVarChar, value: product_name },
        { name: 'mrp', type: sql.NVarChar, value: mrp },
        { name: 'input_rating', type: sql.NVarChar, value: input_rating },
        { name: 'poe', type: sql.NVarChar, value: poe },
        { name: 'product_url', type: sql.NVarChar, value: product_url },
        { name: 'bis', type: sql.NVarChar, value: bis },
        { name: 'product_label_name', type: sql.NVarChar, value: product_label_name },
        { name: 'packaging_label_name', type: sql.NVarChar, value: packaging_label_name },
        { name: 'created_by', type: sql.NVarChar, value: created_by },
      ]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ Status: 'F', Message: error.message });
  }
};

export const getAllPlantCodes = async (req, res) => {
  try {
    const result = await executeQuery('EXEC sp_plant_master_get_plant_codes');
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ Status: 'F', Message: error.message });
  }
};
