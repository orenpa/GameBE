import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGO_URI) throw new Error('❌ MONGO_URI is missing');
if (!process.env.KAFKA_BROKER) throw new Error('❌ KAFKA_BROKER is missing');
if (!process.env.KAFKA_RETRY_TOPIC) throw new Error('❌ KAFKA_RETRY_TOPIC is missing');
if (!process.env.LOG_API_URL) {
  throw new Error('❌ LOG_API_URL is not defined');
}
if (!process.env.REDIS_URL) {
  throw new Error('❌ REDIS_URL is not defined');
}

export const env = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGO_URI,
  kafkaBroker: process.env.KAFKA_BROKER,
  kafkaRetryTopic: process.env.KAFKA_RETRY_TOPIC,
  logApiUrl: process.env.LOG_API_URL,
  redisUrl: process.env.REDIS_URL,
};
