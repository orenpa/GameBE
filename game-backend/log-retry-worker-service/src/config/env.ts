import dotenv from 'dotenv';
dotenv.config();

if (!process.env.KAFKA_BROKER) throw new Error('❌ KAFKA_BROKER is missing');
if (!process.env.KAFKA_RETRY_TOPIC) throw new Error('❌ KAFKA_RETRY_TOPIC is missing');
if (!process.env.KAFKA_DLQ_TOPIC) throw new Error('❌ KAFKA_DLQ_TOPIC is missing');
if (!process.env.MONGO_URI) throw new Error('❌ MONGO_URI is missing');

export const env = {
  kafkaBroker: process.env.KAFKA_BROKER,
  kafkaRetryTopic: process.env.KAFKA_RETRY_TOPIC,
  kafkaDLQTopic: process.env.KAFKA_DLQ_TOPIC,
  mongoUri: process.env.MONGO_URI,
  consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'log-retry-consumer',
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  maxConcurrentWrites: parseInt(process.env.MAX_CONCURRENT_WRITES || '3', 10),
  maxWriteRatePerSecond: parseInt(process.env.MAX_WRITE_RATE_PER_SECOND || '20', 10),
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
};
