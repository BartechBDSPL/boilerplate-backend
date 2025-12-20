import sql from 'mssql/msnodesqlv8.js';

const config = {
  server: '15.206.183.202',
  database: 'matrix_cosmec',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: false,
    trustServerCertificate: true,
    encrypt: false,
  },
  user: 'sa',
  password: 'bdspl@123',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 80000,
  },
};

let mainPool, customerPool;

async function initializeDatabases() {
  try {
    mainPool = await sql.connect(config);
    console.log('Connected to MSSQL (BoilerPlate_WMS)');
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err;
  }
}

async function executeQuery(query, params = {}) {
  if (!mainPool) {
    throw new Error('Main database connection not initialized');
  }

  try {
    const request = mainPool.request();

    if (Array.isArray(params)) {
      params.forEach(param => request.input(param.name, param.type, param.value));
    } else {
      for (const [name, { type, value }] of Object.entries(params)) {
        request.input(name, type, value);
      }
    }
    console.log('Executing Query:', query);
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}
async function executeQueryExisiting(query, params = {}) {
  if (!mainPool) {
    throw new Error('Main database connection not initialized');
  }

  try {
    const request = mainPool.request();

    if (Array.isArray(params)) {
      params.forEach(param => request.input(param.name, param.type, param.value));
    } else {
      for (const [name, { type, value }] of Object.entries(params)) {
        request.input(name, type, value);
      }
    }

    console.log('Executing Query for own database:', query);
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

async function executeUpdateQuery(query, params = {}) {
  if (!customerPool) {
    throw new Error('Customer database connection not initialized');
  }

  try {
    const request = customerPool.request();

    if (Array.isArray(params)) {
      params.forEach(param => request.input(param.name, param.type, param.value));
    } else {
      for (const [name, { type, value }] of Object.entries(params)) {
        request.input(name, type, value);
      }
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error executing customer DB query:', error);
    throw error;
  }
}

async function executeQueryMultipleResults(query, params = {}) {
  if (!mainPool) {
    throw new Error('Main database connection not initialized');
  }

  try {
    const request = mainPool.request();

    if (Array.isArray(params)) {
      params.forEach(param => request.input(param.name, param.type, param.value));
    } else {
      for (const [name, { type, value }] of Object.entries(params)) {
        request.input(name, type, value);
      }
    }

    console.log('Executing Query for multiple result sets:', query);
    const result = await request.query(query);

    return result.recordsets;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

async function closeDatabases() {
  try {
    if (mainPool) {
      await mainPool.close();
      console.log('Closed MSSQL (BoilerPlate_WMS) connection');
    }
    if (customerPool) {
      await customerPool.close();
      console.log('Closed Customer DB (Application_Updates) connection');
    }
  } catch (err) {
    console.error('Error closing database connections:', err);
  }
}

export {
  sql,
  initializeDatabases,
  executeQuery,
  closeDatabases,
  executeUpdateQuery,
  executeQueryExisiting,
  executeQueryMultipleResults,
};
