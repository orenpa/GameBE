import dotenv from 'dotenv';

dotenv.config();


export const env = {
  port: process.env.PORT || 3003,
  mongoUri: process.env.MONGO_URI || '',
};
