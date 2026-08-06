import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './config/env';
import { connectDB } from './config/db';

import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import codeRoutes from './routes/code.routes';
import aiRoutes from './routes/ai.routes';
import jamRoutes from './routes/jam.routes';
import resumeRoutes from './routes/resume.routes';
import interviewRoutes from './routes/interview.routes';
import livekitRoutes from './routes/livekit.routes';
import searchRoutes from './routes/search.routes';
import flashcardRoutes from './routes/flashcard.routes';

import { initStudyRoomGateway } from './gateways/studyRoom.gateway';
import './workers/videoWorker';

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

// Initialize Socket.io Gateway
initStudyRoomGateway(io);

// Security & Global Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/code', codeRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/jam-sessions', jamRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/study-rooms', livekitRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'SYNAPSEAI Backend API',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// Global Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Global Error Handler]:', err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  server.listen(env.PORT, () => {
    console.log(`🚀 [SYNAPSEAI Backend] Server running on http://localhost:${env.PORT}`);
  });
};

startServer();

export default app;
