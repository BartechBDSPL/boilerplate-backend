export const JWT_SECRET = 'bdspl';
export const SAP_CONNECTOR_MIDDLEWARE_URL = 'http://192.168.29.27:3030';
export const originalKey = 'sblw-3hn8-sqoy19';
export const scrappingEmailIds = ['anil.vankar@gerresheimer.com'];
export const scrappingCcEmailIds = ['mumbai.software@bartechdata.net'];
export const frontendUrl = 'http://10.86.20.26:4000';

export const SAP_SERVER = {
  SAPServer: 'vhghggxqci.rise.gxservices.net',
  SystemNumber: '00',
  Client: '100',
  UserId: 'RFC_BARTECH',
  Password: 'GmUx+51r',
  Language: 'EN',
};

// SAP Material Details Service
export const SAP_MATERIAL_SERVICE = {
  BASE_URL: 'https://matrixdev.matrixcomsec.com:44310/sap/bc/zfg_details_srv',
  SAP_CLIENT: '600',
  USERNAME: 'ABAPDEV2',
  PASSWORD: 'Dev@300',
};

// SAP Production Order Service
export const SAP_PRODUCTION_ORDER_SERVICE = {
  BASE_URL: 'https://matrixdev.matrixcomsec.com:44310/sap/bc/ytest1',
  SAP_CLIENT: '600',
  USERNAME: 'ABAPDEV2',
  PASSWORD: 'Dev@300',
};

// Random value helpers for material records
const RANDOM_WORDS = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Sigma', 'Prime', 'Nova', 'Aero', 'Omni', 'Core', 'Flex', 'Quantum', 'Vertex', 'Apex', 'Pulse', 'Zenith'
];

export function generateRandomEAN() {
  // Generate a 13-digit numeric string (EAN-13 like)
  const min = 1e12; // 1000000000000
  const max = 9.999999999999e12; // less than 1e13
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  return String(n).slice(0, 13);
}

export function generateRandomMRP() {
  // Generate a price between 50.00 and 10,000.00 with two decimals
  const value = Math.random() * (10000 - 50) + 50;
  return value.toFixed(2);
}

export function generateRandomProductFamily() {
  // Return 1-3 random words joined
  const count = Math.floor(Math.random() * 3) + 1; // 1..3 words
  const parts = [];
  for (let i = 0; i < count; i++) {
    parts.push(RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)]);
  }
  return parts.join(' ');
}

export function trimLeadingZeros(value) {
  // Remove leading zeros from identifiers (returns '0' if all zeros)
  if (value === null || value === undefined) return value;
  const v = String(value);
  const trimmed = v.replace(/^0+/, '');
  return trimmed === '' ? '0' : trimmed;
}
