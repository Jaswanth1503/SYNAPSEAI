import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import codeRoutes from './routes/code.routes';
import aiRoutes from './routes/ai.routes';
import './workers/videoWorker'; // Initialize BullMQ Video Worker

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/synapseai';

// Global Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/code', codeRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use(aiRoutes);

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SYNAPSEAI Backend API',
    timestamp: new Date().toISOString(),
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// Database Connection & Server Start
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[SYNAPSEAI Backend] Connected successfully to MongoDB');
    app.listen(PORT, () => {
      console.log(`[SYNAPSEAI Backend] Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[SYNAPSEAI Backend] MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
