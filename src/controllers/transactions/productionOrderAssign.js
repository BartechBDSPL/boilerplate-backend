import { executeQuery, sql } from '../../config/db.js';
import { SAP_PRODUCTION_ORDER_SERVICE } from '../../utils/constants.js';
import https from 'https';

// Helper to remove leading zeros from identifiers (returns '0' if all zeros)
const trimLeadingZeros = (value) => {
  if (value === null || value === undefined) return value;
  const v = String(value);
  const trimmed = v.replace(/^0+/, '');
  return trimmed === '' ? '0' : trimmed;
};

// Format production order: trim leading zeros and left-pad with zeros to 12 characters
const formatProductionOrder = (value) => {
  if (value === null || value === undefined) return value;
  const v = String(value).trim();
  const stripped = v.replace(/^0+/, '');
  const base = stripped === '' ? '0' : stripped;
  return base.padStart(12, '0');
};

export const getProductionOrderDetails = async (req, res) => {
  const { production_order } = req.body;

  if (!production_order) {
    return res.json({
      Status: 'F',
      Message: 'production_order is required',
      data: null,
    });
  }

  try {
    // First, call stored procedure to check if order exists locally
    const spResult = await executeQuery(
      `EXEC sp_production_order_order_number_get_details @order_number`,
      [{ name: 'order_number', type: sql.NVarChar, value: production_order }]
    );

    console.log('SP Result:', spResult);

    // Check if SP returned success
    if (spResult && spResult.length > 0) {
      const firstRecord = spResult[0];
      console.log('First Record:', firstRecord);
      if (firstRecord.Status === 'T') {
        // Transform SP response to match SAP API format
        // Filter out rows that only have Status/Message (no order_number)
        const transformedData = spResult
          .filter(row => row.order_number) // Keep only rows with actual data
          .map(row => ({
            productionorder: formatProductionOrder(row.order_number),
            material: trimLeadingZeros(row.material_number),
            materialdescription: row.material_description,
            batch: row.batch_number,
            serialno: row.serial_no,
            assigned_date: row.assigned_date,
            assigned_by: row.assigned_by,
            assigned_line: row.assigned_line,
            totalqty: row.quantity,
            basicstartdate: row.basic_start_date,
            basicenddate: row.basic_end_date, 
          }));

        try {
          const enrichedData = await Promise.all(
            transformedData.map(async (item) => {
              try {
                const trimmedMaterial = trimLeadingZeros(item.material);
                const matDetails = await executeQuery(
                  `EXEC sp_label_printing_get_material_details @material_number`,
                  [{ name: 'material_number', type: sql.NVarChar, value: trimmedMaterial }]
                );
                
                // Check if SP returned empty result (material not in master)
                if (!matDetails || matDetails.length === 0) {
                  return {
                    Status: 'F',
                    Message: `Material ${trimmedMaterial} not found in material master`,
                    data: null,
                  };
                }
                
                // Extract material-specific fields from SP result (skip Status/Message rows)
                const matData = matDetails.find(row => row.product_name || row.material_description);
                
                if (!matData) {
                  return {
                    Status: 'F',
                    Message: `Material ${trimmedMaterial} details not available in material master`,
                    data: null,
                  };
                }
                
                return {
                  ...item,
                  product_name: matData.product_name,
                  input_rating: matData.input_rating,
                  product_url: matData.product_url,
                };
              } catch (error) {
                console.error(`Error fetching material details for ${item.material}:`, error);
                return {
                  Status: 'F',
                  Message: `Error fetching material ${item.material} details: ${error.message}`,
                  data: null,
                };
              }
            })
          );

          // Check if any enrichment returned error status
          const errorItem = enrichedData.find(item => item.Status === 'F');
          if (errorItem) {
            return res.status(200).json({
              Status: 'F',
              Message: errorItem.Message,
              data: null,
            });
          }

          // SP returned data successfully, return it
          return res.status(200).json({
            Status: 'T',
            Message: 'Production order details fetched from local database',
            data: enrichedData,
          });
        } catch (error) {
          console.error('Error enriching SP data with material details:', error);
          return res.status(200).json({
            Status: 'F',
            Message: error.message || 'Error enriching production order details',
            data: null,
          });
        }
      }
  }

    // If SP returned 'F' or no data, call SAP API
    const sapUrl = `${SAP_PRODUCTION_ORDER_SERVICE.BASE_URL}?sap-client=${SAP_PRODUCTION_ORDER_SERVICE.SAP_CLIENT}`;
    const sapResult = await callSAPProductionOrderService(sapUrl, production_order);

    if (sapResult && sapResult.length > 0) {
      // Add null values for local database fields that SAP doesn't provide
      const enhancedSapResult = sapResult.map(item => {
        const obj = { ...item, assigned_date: null, assigned_by: null, assigned_line: null };
        if (obj.productionorder) obj.productionorder = formatProductionOrder(obj.productionorder);
        if (obj.productionOrder) obj.productionOrder = formatProductionOrder(obj.productionOrder);
        if (obj.order_number) obj.order_number = formatProductionOrder(obj.order_number);
        if (obj.material) obj.material = trimLeadingZeros(obj.material);
        if (obj.materialNumber) obj.materialNumber = trimLeadingZeros(obj.materialNumber);
        return obj;
      });

      try {
        // Fetch material details for each production order
        const enrichedSapData = await Promise.all(
          enhancedSapResult.map(async (item) => {
            try {
              // Get material identifier (try different possible field names)
              const matNum = item.material || item.materialNumber || item.material_number;
              if (!matNum) {
                return {
                  Status: 'F',
                  Message: 'No material number found in production order',
                  data: null,
                };
              }
              
              const trimmedMaterial = trimLeadingZeros(matNum);
              const matDetails = await executeQuery(
                `EXEC sp_label_printing_get_material_details @material_number`,
                [{ name: 'material_number', type: sql.NVarChar, value: trimmedMaterial }]
              );
              
              // Check if SP returned empty result (material not in master)
              if (!matDetails || matDetails.length === 0) {
                return {
                  Status: 'F',
                  Message: `Material ${trimmedMaterial} not found in material master`,
                  data: null,
                };
              }
              
              // Extract material-specific fields from SP result (skip Status/Message rows)
              const matData = matDetails.find(row => row.product_name || row.material_description);
              
              if (!matData) {
                return {
                  Status: 'F',
                  Message: `Material ${trimmedMaterial} details not available in material master`,
                  data: null,
                };
              }
              
              return {
                ...item,
                product_name: matData.product_name,
                input_rating: matData.input_rating,
                product_url: matData.product_url,
              };
            } catch (error) {
              console.error(`Error fetching material details for SAP result:`, error);
              return {
                Status: 'F',
                Message: `Error fetching material details: ${error.message}`,
                data: null,
              };
            }
          })
        );

        // Check if any enrichment returned error status
        const errorItem = enrichedSapData.find(item => item.Status === 'F');
        if (errorItem) {
          return res.status(200).json({
            Status: 'F',
            Message: errorItem.Message,
            data: null,
          });
        }

        return res.status(200).json({
          Status: 'T',
          Message: 'Production order details fetched from SAP',
          data: enrichedSapData,
        });
      } catch (error) {
        console.error('Error enriching SAP data with material details:', error);
        return res.status(200).json({
          Status: 'F',
          Message: error.message || 'Error enriching production order details',
          data: null,
        });
      }
    }

    res.status(200).json({
      Status: 'F',
      Message: 'No production order details found',
      data: null,
    });
  } catch (error) {
    console.error('Error in getProductionOrderDetails:', error);
    res.status(500).json({
      Status: 'F',
      Message: error.message,
      data: null,
    });
  }
};

// Helper function to call SAP Production Order Service
const callSAPProductionOrderService = (url, productionOrder) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      ProductionOrder: productionOrder,
    });

    // Create Basic Auth header
    const auth = Buffer.from(
      `${SAP_PRODUCTION_ORDER_SERVICE.USERNAME}:${SAP_PRODUCTION_ORDER_SERVICE.PASSWORD}`
    ).toString('base64');

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Basic ${auth}`,
      },
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

export const insertProductionOrder = async (req, res) => {
  const {
    order_number,
    batch_number,
    material_number,
    material_description,
    total_qty,
    basic_start_date,
    basic_end_date,
    assigned_line,
    serial_no_count,
    serial_no,
    created_by,
  } = req.body;
  // console.log(req.body);
  //     return res.json({
  //     Status: 'F',
  //     Message: 'HELLO EHLLL',
  //     data: null,
  //   });
  // Validate required fields
  if (
    !order_number ||
    !batch_number ||
    !material_number ||
    !material_description ||
    !assigned_line ||
    !serial_no ||
    !created_by
  ) {
    return res.json({
      Status: 'F',
      Message: 'Missing required fields',
      data: null,
    });
  }

  try {
    // Call first SP: sp_production_order_insert
    const poResult = await executeQuery(
      `EXEC sp_production_order_insert 
         @order_number, @batch_number, @material_number, @material_description, 
         @total_qty, @basic_start_date, @basic_end_date, @assigned_line, 
         @serial_no_count, @created_by`,
      [
        { name: 'order_number', type: sql.NVarChar, value: order_number },
        { name: 'batch_number', type: sql.NVarChar, value: batch_number },
        { name: 'material_number', type: sql.NVarChar, value: material_number },
        { name: 'material_description', type: sql.NVarChar, value: material_description },
        { name: 'total_qty', type: sql.Int, value: total_qty || 0 },
        { name: 'basic_start_date', type: sql.NVarChar, value: basic_start_date || '' },
        { name: 'basic_end_date', type: sql.NVarChar, value: basic_end_date || '' },
        { name: 'assigned_line', type: sql.NVarChar, value: assigned_line },
        { name: 'serial_no_count', type: sql.Int, value: serial_no_count || 1 },
        { name: 'created_by', type: sql.NVarChar, value: created_by },
      ]
    );

    console.log('PO Result:', poResult);

    // Check if first SP returned success
    if (!poResult || !poResult[0] || poResult[0].Status !== 'T') {
      return res.json({
        Status: 'F',
        Message: poResult && poResult[0] ? poResult[0].Message : 'Failed to insert production order',
        data: null,
      });
    }
    // If line was reassigned (UPDATE operation), return early without processing serial numbers
    if (poResult[0].Message === 'Line reassigned successfully.') {
      return res.status(200).json({
        Status: 'T',
        Message: poResult[0].Message,
        data: null,
      });
    }

    const serialNumbers = serial_no.split('$').filter(s => s.trim());
    const quantities = total_qty ? total_qty.split('$').filter(q => q.trim()) : [];

    for (let i = 0; i < serialNumbers.length; i++) {
      const sn = serialNumbers[i];
      const qty = parseInt(quantities[i].trim())

      const labelResult = await executeQuery(
        `EXEC sp_label_printing_insert 
           @order_number, @material_number, @material_description, 
           @batch_number, @serial_no, @quantity, @inserted_by`,
        [
          { name: 'order_number', type: sql.NVarChar, value: order_number },
          { name: 'material_number', type: sql.NVarChar, value: material_number },
          { name: 'material_description', type: sql.NVarChar, value: material_description },
          { name: 'batch_number', type: sql.NVarChar, value: batch_number },
          { name: 'serial_no', type: sql.NVarChar, value: sn.trim() },
          { name: 'quantity', type: sql.Int, value: qty },
          { name: 'inserted_by', type: sql.NVarChar, value: created_by },
        ]
      );

      if (!labelResult || !labelResult[0] || labelResult[0].Status !== 'T') {
        return res.json({
          Status: 'F',
          Message: labelResult && labelResult[0] ? labelResult[0].Message : `Failed to insert label printing for serial ${sn}`,
          data: null,
        });
      }
    }

    // Both SPs succeeded for all serial numbers
    res.status(200).json({
      Status: 'T',
      Message: `Production order added and ${serialNumbers.length} label(s) assigned successfully`,
      data: null,
    });
  } catch (error) {
    console.error('Error in insertProductionOrder:', error);
    res.status(500).json({
      Status: 'F',
      Message: error.message,
      data: null,
    });
  }
};

export const getRecentAssignedProductionOrders = async (req, res) => {
  try {
    const result = await executeQuery('EXEC [dbo].[getRecentAssignedProductionOrders]');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
