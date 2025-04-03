import dotenv from 'dotenv';
dotenv.config();

if (!process.env.KAFKA_BROKER) {
  throw new Error('❌ KAFKA_BROKER is not defined');
}
if (!process.env.KAFKA_TOPIC) {
  throw new Error('❌ KAFKA_TOPIC is not defined');
}
if (!process.env.MONGO_URI) {
  throw new Error('❌ MONGO_URI is not defined');
}

export const env = {
  kafkaBroker: process.env.KAFKA_BROKER,
  kafkaTopic: process.env.KAFKA_TOPIC,
  mongoUri: process.env.MONGO_URI,
  consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'log-consumer-group',
};
