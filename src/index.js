import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { initializeDatabases } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import masterRoutes from './routes/master-routes.js';
import adminRoutes from './routes/adminRoutes.js';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactionRoutes.js';
import hhtRoutes from './routes/hhtRoutes.js';
import reprintRoutes from './routes/reprintRoutes.js';
import reportsRoute from './routes/reportsRoute.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import sessionManager from './utils/sessionManager.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

export default app;

app.use((req, res, next) => {
  res.setTimeout(120000, () => {
    console.log('Request has timed out.');
  });
  next();
});

app.use(cors({ origin: true }));
app.options('*', cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(helmet());

app.use('/images', express.static('images'));

app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/hht', hhtRoutes);
app.use('/api/reprint', reprintRoutes);
app.use('/api/reports', reportsRoute);
app.use('/api/dashboard', dashboardRoutes);

app.use('/', (req, res) => {
  res.send('Welcome to WMS Gerreishemer API');
});

async function startServer() {
  try {
    await initializeDatabases();

    console.log('🔧 Initializing session manager...');
    try {
      await sessionManager.getSessionTimeout();
      console.log('✅ Session manager initialized successfully');
    } catch (error) {
      console.log('⚠️ Session manager will initialize on first use');
    }

    if (process.env.NODE_ENV !== 'test') {
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');

  sessionManager.shutdown();

  process.exit(0);
});
