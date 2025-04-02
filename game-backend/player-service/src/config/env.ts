import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGO_URI || '',
};
