import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/synapseai'),
  JWT_SECRET: z.string().default('access_secret_key_change_in_production'),
  JWT_REFRESH_SECRET: z.string().default('refresh_secret_key_change_in_production'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().default('6379').transform((val) => parseInt(val, 10)),
  OPENAI_API_KEY: z.string().optional().default('dummy_openai_key'),
  ANTHROPIC_API_KEY: z.string().optional().default('dummy_anthropic_key'),
  JUDGE0_API_URL: z.string().default('https://judge0-ce.p.rapidapi.com'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default('dummy_cloud_name'),
  CLOUDINARY_API_KEY: z.string().optional().default('dummy_api_key'),
  CLOUDINARY_API_SECRET: z.string().optional().default('dummy_api_secret'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Environment variable validation failed');
}

export const env = _env.data;
