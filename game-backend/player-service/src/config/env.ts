import dotenv from 'dotenv';
import { ERROR_MESSAGES } from '../constants/error.constants';

dotenv.config();

if (!process.env.MONGO_URI) throw new Error(ERROR_MESSAGES.ENV.MISSING_MONGO_URI);
if (!process.env.KAFKA_BROKER) throw new Error(ERROR_MESSAGES.ENV.MISSING_KAFKA_BROKER);
if (!process.env.KAFKA_RETRY_TOPIC) throw new Error(ERROR_MESSAGES.ENV.MISSING_KAFKA_RETRY_TOPIC);
if (!process.env.LOG_API_URL) {
  throw new Error(ERROR_MESSAGES.ENV.MISSING_LOG_API_URL);
}
if (!process.env.REDIS_URL) {
  throw new Error(ERROR_MESSAGES.ENV.MISSING_REDIS_URL);
}

export const env = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGO_URI,
  kafkaBroker: process.env.KAFKA_BROKER,
  kafkaRetryTopic: process.env.KAFKA_RETRY_TOPIC,
  logApiUrl: process.env.LOG_API_URL,
  redisUrl: process.env.REDIS_URL,
};
