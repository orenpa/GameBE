import dotenv from 'dotenv';
import { SYSTEM_MESSAGES } from '../constants/system.constants';
import { LOG_CONFIG } from '../constants/log.constants';
import { REDIS_CONFIG } from '../constants/redis.constants';
import { CONFIG } from '../constants/config.constants';

dotenv.config();

if (!process.env.KAFKA_BROKER) {
  throw new Error(SYSTEM_MESSAGES.ERROR.ENV_MISSING('KAFKA_BROKER'));
}
if (!process.env.KAFKA_RETRY_TOPIC) {
  throw new Error(SYSTEM_MESSAGES.ERROR.ENV_MISSING('KAFKA_RETRY_TOPIC'));
}
if (!process.env.MONGO_URI) {
  throw new Error(SYSTEM_MESSAGES.ERROR.ENV_MISSING('MONGO_URI'));
}

export const env = {
  kafkaBroker: process.env.KAFKA_BROKER,
  kafkaRetryTopic: process.env.KAFKA_RETRY_TOPIC,
  kafkaDLQTopic: process.env.KAFKA_DLQ_TOPIC || CONFIG.DEFAULT.KAFKA_DLQ_TOPIC,
  mongoUri: process.env.MONGO_URI,
  consumerGroup: process.env.KAFKA_CONSUMER_GROUP || LOG_CONFIG.CONSUMER.GROUP_ID,
  maxConcurrentWrites: parseInt(process.env.MAX_CONCURRENT_WRITES || CONFIG.DEFAULT.MAX_CONCURRENT_WRITES.toString(), 10),
  maxWriteRatePerSecond: parseInt(process.env.MAX_WRITE_RATE_PER_SECOND || CONFIG.DEFAULT.MAX_WRITE_RATE_PER_SECOND.toString(), 10),
  redisUrl: process.env.REDIS_URL || REDIS_CONFIG.DEFAULT_URL,
  maxRetries: parseInt(process.env.MAX_RETRIES || CONFIG.DEFAULT.MAX_RETRIES.toString(), 10),
};
