import { executeQuery, sql } from '../../config/db.js';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to clean special characters from data
const cleanSpecialCharacters = (value) => {
  if (!value) return value;
  if (typeof value !== 'string') return String(value);
  return value
    .replace(/\u00AD/g, '-')  // Replace soft hyphen with regular hyphen
    .replace(/˚/g, '°')        // Replace ring above with degree symbol
    .replace(/­/g, '-');       // Replace any other soft hyphens
};

function preparePrnFile(data, labelFile) {
  const basePath = path.join(__dirname, '..', '..', 'prn-printer');
  const templatePath = path.join(basePath, labelFile);

  try {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${labelFile}`);
    }

    let contentBuffer = fs.readFileSync(templatePath);

    let content = contentBuffer.toString('latin1');

    Object.keys(data).forEach(key => {
      const regex = new RegExp(key, 'g');
      let value = String(data[key] || '');
      
      // Clean special characters first
      value = cleanSpecialCharacters(value);
      
      // Replace degree symbol (°) with the correct latin1 byte representation
      // The degree symbol in UTF-8 needs to be converted to 0xB0 in latin1
      value = value.replace(/°/g, String.fromCharCode(0xB0));
      
      content = content.replace(regex, value);
    });

    return Buffer.from(content, 'latin1');
  } catch (error) {
    console.error('Error preparing PRN content:', error);
    throw error;
  }
}

function prepareFGLabelData(prnDetails, reqData, labelFile) {
  const baseData = {
    VAddress1: prnDetails.company_address_1 || '',
    VAddress2: prnDetails.company_address_2 || '',
    VCategoryName: reqData.sub_category_name || '',
    VCompanyName: prnDetails.company_name || '',
    VCustCareNo: prnDetails.customer_care_no || '',
    VEmail: prnDetails.email || '',
    VMake: prnDetails.make || '',
    VModel: reqData.model_name || '',
    VSerialNo: reqData.serial_no || '',
    VSupply: reqData.input_rating || '',
  };

  if (labelFile.includes('BINOCULAR_MICROSCOPE')) {
    return {
      ...baseData,
      VSupply: reqData.input_rating || '',
    };
  } else if (labelFile.includes('BLOOD_BANK_REFRIGERATOR') || labelFile.includes('DEEP_FREEZER')) {
    return {
      ...baseData,
      VCapacity: reqData.capacity || '',
      VInputRating: reqData.input_rating || '',
      VNameOfRefrigerant: reqData.name_of_refrigerant || '',
      VOperatingTemp: reqData.operating_temp || '',
      VWeightOfMachine: reqData.weight_of_machine || '',
      VSupply: reqData.input_rating || '',

    };
  } else if (labelFile.includes('MULTICHANNEL_PIPETTE')) {
    return baseData;
  } else if (labelFile.includes('SERVO_CONTROLLED_VOLTAGE_STABILIZER')) {
    return {
      ...baseData,
      VCapacity: reqData.capacity || '',
      VOutputVolt: reqData.output_volt || '',
      VVoltMax: reqData.input_volt_max || '',
      VInputRating: reqData.input_rating || '',
      VVoltMin: reqData.input_volt_min || '',
      VSupply: reqData.input_rating || '',
    };
  }

  return {
    ...baseData,
    VCapacity: reqData.capacity || '',
    VInputRating: reqData.input_rating || '',
    VNameOfRefrigerant: reqData.name_of_refrigerant || '',
    VOperatingTemp: reqData.operating_temp || '',
    VWeightOfMachine: reqData.weight_of_machine || '',
    VOutputVolt: reqData.output_volt || '',
    VVoltMax: reqData.input_volt_max || '',
    VVoltMin: reqData.input_volt_min || '',
  };
}

async function batchPrintToTscPrinter(printJobs, printerIP, printerPort) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.setTimeout(2000);

    client.connect(
      {
        host: printerIP,
        port: parseInt(printerPort) || 9100,
      },
      async () => {
        try {
          const combinedContent = fs.readFileSync(printJobs.tempFilePath);

          client.write(combinedContent, err => {
            if (err) {
              console.error('Error in batch printing:', err);
              reject(err);
            } else {
              console.log(`Print job completed. File retained at: ${printJobs.tempFilePath}`);
              client.end();
              resolve();
            }
          });
        } catch (error) {
          client.destroy();
          reject(error);
        }
      }
    );

    client.on('error', err => {
      console.error('Printer connection error:', err);
      client.destroy();
      reject(new Error('Printer not found'));
    });

    client.on('timeout', () => {
      console.error('Printer connection timeout');
      client.destroy();
      reject(new Error('Printer not found'));
    });
  });
}

export const insertReprintFGLabel = async (req, res) => {
  try {
    const {
      factory_name,
      category_code,
      category_name,
      sub_category_code,
      sub_category_name,
      model_code,
      model_name,
      model_description,
      serial_no,
      warranty,
      capacity,
      input_rating,
      name_of_refrigerant,
      operating_temp,
      weight_of_machine,
      output_volt,
      input_volt_min,
      input_volt_max,
      label_file,
      label_name,
      reprint_reason,
      number_of_labels,
      reprint_by,
      printer_ip,
    } = req.body;
    console.log(req.body);

    let printerIP, printerPort;
    if (printer_ip && label_file) {
      [printerIP, printerPort] = printer_ip.split(':');
      const portNumber = parseInt(printerPort) || 9100;

      // Check printer connectivity
      // const printerInRange = await isPrinterReachable(printerIP, portNumber);
      // if (!printerInRange) {
      //   return res.status(400).json({
      //     Status: 'F',
      //     Message: 'Printer is out of range or not reachable',
      //   });
      // }
    }

    let prnDetails = null;
    if (label_name) {
      prnDetails = await executeQuery(`EXEC [dbo].[sp_prn_file_get_all_details] @prn_file_name`, [
        { name: 'prn_file_name', type: sql.NVarChar(100), value: label_name },
      ]);

      if (!prnDetails || prnDetails.length === 0) {
        return res.status(400).json({
          Status: 'F',
          Message: 'PRN file details not found',
        });
      }
    }

    console.log('PRN Details:', prnDetails);

    const result = await executeQuery(
      `EXEC [dbo].[sp_reprint_fg_label_insert] @factory_name, @category_code, @category_name, @sub_category_code, @sub_category_name, @model_code, @model_name, @model_description, @serial_no, @warranty, @capacity, @input_rating, @name_of_refrigerant, @operating_temp, @weight_of_machine, @output_volt, @input_volt_min, @input_volt_max, @label_file, @reprint_reason, @number_of_labels, @reprint_by`,
      [
        { name: 'factory_name', type: sql.NVarChar(50), value: factory_name },
        { name: 'category_code', type: sql.NVarChar(2), value: category_code },
        { name: 'category_name', type: sql.NVarChar(100), value: category_name },
        { name: 'sub_category_code', type: sql.NVarChar(2), value: sub_category_code },
        { name: 'sub_category_name', type: sql.NVarChar(100), value: sub_category_name },
        { name: 'model_code', type: sql.NVarChar(2), value: model_code },
        { name: 'model_name', type: sql.NVarChar(50), value: model_name },
        { name: 'model_description', type: sql.NVarChar(150), value: model_description },
        { name: 'serial_no', type: sql.NVarChar(255), value: serial_no },
        { name: 'warranty', type: sql.Int, value: parseInt(warranty) },
        { name: 'capacity', type: sql.NVarChar(50), value: capacity },
        { name: 'input_rating', type: sql.NVarChar(50), value: input_rating },
        { name: 'name_of_refrigerant', type: sql.NVarChar(50), value: name_of_refrigerant },
        { name: 'operating_temp', type: sql.NVarChar(50), value: operating_temp },
        { name: 'weight_of_machine', type: sql.NVarChar(50), value: weight_of_machine },
        { name: 'output_volt', type: sql.NVarChar(50), value: output_volt },
        { name: 'input_volt_min', type: sql.NVarChar(10), value: input_volt_min },
        { name: 'input_volt_max', type: sql.NVarChar(10), value: input_volt_max },
        { name: 'label_file', type: sql.NVarChar(100), value: label_file },
        { name: 'reprint_reason', type: sql.NVarChar(100), value: reprint_reason },
        { name: 'number_of_labels', type: sql.Int, value: parseInt(number_of_labels) || 1 },
        { name: 'reprint_by', type: sql.NVarChar(50), value: reprint_by },
      ]
    );

    if (result[0].Status !== 'T') {
      return res.status(400).json(result[0]);
    }

    if (printer_ip && label_file) {
      try {
        const persistentFilePath = path.join(__dirname, 'reprint_fg_label.prn');

        const prnData = prepareFGLabelData(
          prnDetails[0],
          {
            category_name,
            sub_category_name,
            model_name,
            serial_no: serial_no.trim(),
            capacity,
            input_rating,
            name_of_refrigerant,
            operating_temp,
            weight_of_machine,
            output_volt,
            input_volt_min,
            input_volt_max,
          },
          label_file
        );

        const prnContent = preparePrnFile(prnData, label_file);
        if (!prnContent) {
          throw new Error('Failed to prepare PRN content');
        }

        const labelsCount = parseInt(number_of_labels) || 1;

        const combinedContent = Buffer.concat(Array(labelsCount).fill(prnContent));

        fs.writeFileSync(persistentFilePath, combinedContent);

        await batchPrintToTscPrinter({ tempFilePath: persistentFilePath }, printerIP, printerPort || '9100');

        res.status(200).json({
          Status: 'T',
          Message: `Reprint record inserted and ${labelsCount} label(s) printed successfully`,
          printed: true,
          labels_printed: labelsCount,
        });
      } catch (printError) {
        console.error('Printing error:', printError);
        const errorMessage =
          printError.message === 'Printer not found'
            ? 'Cannot find printer but transaction performed successfully'
            : `Printing failed: ${printError.message}. Transaction performed successfully`;
        res.status(200).json({
          Status: 'T',
          Message: errorMessage,
          printed: false,
        });
      }
    } else {
      res.status(200).json({
        Status: 'T',
        Message: 'Reprint record inserted successfully',
        printed: false,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getReprintFGLabelDetails = async (req, res) => {
  try {
    const {
      factory_name,
      category_code,
      sub_category_code,
      model_code,
      model_name,
      model_description,
      from_date,
      to_date,
    } = req.body;
    console.log(req.body);
    const result = await executeQuery(
      `EXEC [dbo].[sp_reprint_fg_label_get_details] @factory_name, @category_code, @sub_category_code, @model_code, @model_name, @model_description, @from_date, @to_date`,
      [
        { name: 'factory_name', type: sql.NVarChar(50), value: factory_name || null },
        { name: 'category_code', type: sql.NVarChar(2), value: category_code || null },
        { name: 'sub_category_code', type: sql.NVarChar(2), value: sub_category_code || null },
        { name: 'model_code', type: sql.NVarChar(2), value: model_code || null },
        { name: 'model_name', type: sql.NVarChar(50), value: model_name || null },
        { name: 'model_description', type: sql.NVarChar(150), value: model_description || null },
        { name: 'from_date', type: sql.NVarChar(10), value: from_date || null },
        { name: 'to_date', type: sql.NVarChar(10), value: to_date || null },
      ]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
