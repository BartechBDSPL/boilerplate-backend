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

function isPrinterReachable(ip, port) {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(3000);

    const printerPort = parseInt(port) || 9100;

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect({
      host: ip,
      port: printerPort,
    });
  });
}

async function printToTscPrinter(prnFilePath, printerIP, printerPort) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(30000);

    client.connect(
      {
        host: printerIP,
        port: parseInt(printerPort) || 9100,
      },
      () => {
        const prnContent = fs.readFileSync(prnFilePath);
        client.write(prnContent, err => {
          if (err) {
            console.error('Error in printing:', err);
            reject(err);
          } else {
            client.end();
            resolve();
          }
        });
      }
    );

    client.on('error', err => {
      console.error('Printer connection error:', err);
      client.destroy();
      reject(new Error('Printer connection failed'));
    });

    client.on('timeout', () => {
      console.error('Printer connection timeout');
      client.destroy();
      reject(new Error('Printer connection timeout'));
    });
  });
}

async function batchPrintToTscPrinter(printJobs, printerIP, printerPort) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(30000);

    client.connect(
      {
        host: printerIP,
        port: parseInt(printerPort) || 9100,
      },
      async () => {
        try {
          let combinedContent = Buffer.concat(printJobs.map(job => fs.readFileSync(job.prnFilePath)));

          client.write(combinedContent, err => {
            if (err) {
              console.error('Error in batch printing:', err);
              reject(err);
            } else {
              console.log(`Batch print completed. File retained at: ${printJobs[0].prnFilePath}`);
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
      reject(new Error('Printer connection failed'));
    });

    client.on('timeout', () => {
      console.error('Printer connection timeout');
      client.destroy();
      reject(new Error('Printer connection timeout'));
    });
  });
}

function preparePrnFile(data) {
  const templatePath = path.join(__dirname, '..', '..', 'prn-printer', 'StorageType5050.prn');

  const persistentPrnPath = path.join(__dirname, 'location_label_print.prn');

  try {
    let template = fs.readFileSync(templatePath, 'utf-8');

    Object.keys(data).forEach(key => {
      // Clean special characters from the value before replacement
      const cleanedValue = cleanSpecialCharacters(data[key]);
      template = template.replace(new RegExp(key, 'g'), cleanedValue);
    });

    fs.writeFileSync(persistentPrnPath, template);
    return persistentPrnPath;
  } catch (error) {
    console.error('Error preparing PRN file:', error);
    return null;
  }
}

export const updatePrintLocation = async (req, res) => {
  const { Bin, Warehouse, PrintBy, IP, NoOfLabels } = req.body;
  const [printerIP, printerPort] = IP.split(':');
  const portNumber = parseInt(printerPort) || 9100;

  try {
    const printerInRange = await isPrinterReachable(printerIP, portNumber);
    if (!printerInRange) {
      return res.status(400).json({ error: 'Printer out of range' });
    }

    const bins = Bin.split('$');
    const warehouses = Warehouse.split('$');

    const printJobs = [];

    for (let i = 0; i < bins.length; i++) {
      await executeQuery(
        `EXEC [dbo].[Sp_WH_UpdatePrintLocation] 
                @Bin, @Warehouse, @PrintBy`,
        [
          { name: 'Bin', type: sql.NVarChar(20), value: bins[i] },
          { name: 'Warehouse', type: sql.NVarChar(50), value: warehouses[i] },
          { name: 'PrintBy', type: sql.NVarChar(50), value: PrintBy },
        ]
      );

      const printData = {
        VBarcode: bins[i],
        VStorageType: warehouses[i],
        VStorageTypeSap: '',
      };

      for (let j = 0; j < NoOfLabels; j++) {
        const prnFilePath = preparePrnFile(printData);
        if (prnFilePath) {
          printJobs.push({ prnFilePath });
        }
      }
    }

    if (printJobs.length > 0) {
      await batchPrintToTscPrinter(printJobs, printerIP, portNumber);
    }

    res.json({
      success: true,
      message: 'All locations updated and printed successfully',
    });
  } catch (error) {
    console.error('Error updating print location:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};

export const getLocationPrintingData = async (req, res) => {
  const { Warehouse, Printed } = req.body;

  try {
    const result = await executeQuery(
      `EXEC [dbo].[Sp_WH_LocationPrintingData] 
            @Warehouse, @Printed`,
      [
        { name: 'Warehouse', type: sql.NVarChar(50), value: Warehouse },
        { name: 'Printed', type: sql.NVarChar(10), value: Printed },
      ]
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching location printing data:', error);
    res.status(500).json({ error: 'Failed to execute stored procedure' });
  }
};
