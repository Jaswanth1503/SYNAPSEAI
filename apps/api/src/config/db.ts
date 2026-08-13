import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout for local dev resilience
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`[MongoDB] Local connection warning (${error.message}). Server running in dev fallback mode.`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime error:', err);
});
