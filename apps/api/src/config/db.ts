import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`⚠️ [MongoDB Warning]: ${error.message}`);
    console.warn('⚠️ Server will continue running for route & AI endpoint testing.');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime error:', err);
});
