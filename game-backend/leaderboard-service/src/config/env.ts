import dotenv from 'dotenv';
import { SYSTEM_MESSAGES } from '../constants/system.constants';
import { MONGO_CONFIG } from '../constants/mongo.constants';

dotenv.config();

if (!process.env.LOG_API_URL) {
  throw new Error(SYSTEM_MESSAGES.ERROR.ENV_MISSING('LOG_API_URL'));
}

export const env = {
  port: Number(process.env.PORT) || 3003,
  mongoUri: process.env.MONGO_URI || MONGO_CONFIG.DEFAULT_URI,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  logApiUrl: process.env.LOG_API_URL || 'http://localhost:3004',
} as const;
