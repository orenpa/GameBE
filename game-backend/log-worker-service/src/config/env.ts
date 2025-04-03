import dotenv from 'dotenv';
dotenv.config();

if (!process.env.KAFKA_BROKER) {
  throw new Error('❌ KAFKA_BROKER is not defined');
}
if (!process.env.KAFKA_LOG_TOPIC) {
  throw new Error('❌ KAFKA_LOG_TOPIC is not defined');
}
if (!process.env.MONGO_URI) {
  throw new Error('❌ MONGO_URI is not defined');
}

export const env = {
  kafkaBroker: process.env.KAFKA_BROKER,
  kafkaLogTopic: process.env.KAFKA_LOG_TOPIC, // <- changed from generic KAFKA_TOPIC
  mongoUri: process.env.MONGO_URI,
  consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'log-consumer-group',
  kafkaRetryTopic: process.env.KAFKA_RETRY_TOPIC || 'log-retries',
  maxConcurrentWrites: parseInt(process.env.MAX_CONCURRENT_WRITES || '3', 10),
  maxWriteRatePerSecond: parseInt(process.env.MAX_WRITE_RATE_PER_SECOND || '20', 10),
};
