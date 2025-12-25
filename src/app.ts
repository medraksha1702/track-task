import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import machineRoutes from './routes/machineRoutes';
import serviceRoutes from './routes/serviceRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import reportRoutes from './routes/reportRoutes';
import amcRoutes from './routes/amcRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { sequelize } from './models';

dotenv.config();

const app: Express = express();

// Middleware
// CORS configuration - allow multiple origins
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test database connection
app.get('/health/db', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', message: 'Database connection successful' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/amcs', amcRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;

