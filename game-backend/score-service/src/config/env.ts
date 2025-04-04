import dotenv from 'dotenv';
import { ERROR_MESSAGES } from '../constants/error.constants';

dotenv.config();

if (!process.env.LOG_API_URL) {
  throw new Error(ERROR_MESSAGES.ENV.MISSING_LOG_API_URL);
}

if (!process.env.REDIS_URL) {
  throw new Error(ERROR_MESSAGES.ENV.MISSING_REDIS_URL);
}

export const env = {
  port: process.env.PORT || 3002,
  mongoUri: process.env.MONGO_URI || '',
  logApiUrl: process.env.LOG_API_URL,
  redisUrl: process.env.REDIS_URL,
};
