import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './config/env';
import { connectDB } from './config/db';

import authRoutes from './routes/auth.routes';
import videoRoutes from './routes/video.routes';
import workspaceRoutes from './routes/workspace.routes';
import codeRoutes from './routes/code.routes';
import aiRoutes from './routes/ai.routes';
import quizRoutes from './routes/quiz.routes';
import jamRoutes from './routes/jam.routes';
import resumeRoutes from './routes/resume.routes';
import interviewRoutes from './routes/interview.routes';
import livekitRoutes from './routes/livekit.routes';
import searchRoutes from './routes/search.routes';
import flashcardRoutes from './routes/flashcard.routes';
import analyticsRoutes from './routes/analytics.routes';
import certificateRoutes from './routes/certificate.routes';
import jobRoutes from './routes/job.routes';

import { generalLimiter } from './middleware/rateLimiter';
import { globalErrorHandler } from './middleware/error';
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

// Apply General Rate Limiter to all API routes (100 req / 1 min)
app.use('/api', generalLimiter);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/code', codeRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/jam-sessions', jamRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/study-rooms', livekitRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/certificates', certificateRoutes);
app.use('/api/v1/jobs', jobRoutes);

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'SYNAPSEAI Backend API',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Global Error Handler Middleware
app.use(globalErrorHandler);

// Start Express Server
const PORT = env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[SYNAPSEAI API] Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });
});

export default app;
