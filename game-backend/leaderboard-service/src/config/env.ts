import dotenv from 'dotenv';

dotenv.config();

if (!process.env.LOG_API_URL) {
  throw new Error('❌ LOG_API_URL is not defined');
}

export const env = {
  port: process.env.PORT || 3003,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/leaderboard',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  logApiUrl: process.env.LOG_API_URL || 'http://localhost:3004',
};
