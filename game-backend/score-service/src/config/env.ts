import dotenv from 'dotenv';

dotenv.config();

if (!process.env.LOG_API_URL) {
  throw new Error('❌ LOG_API_URL is not defined');
}

export const env = {
  port: process.env.PORT || 3002,
  mongoUri: process.env.MONGO_URI || '',
  logApiUrl: process.env.LOG_API_URL,
};
