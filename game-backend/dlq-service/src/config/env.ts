import dotenv from 'dotenv';
dotenv.config();

if (!process.env.KAFKA_BROKER) throw new Error('❌ KAFKA_BROKER is missing');
if (!process.env.KAFKA_DLQ_TOPIC) throw new Error('❌ KAFKA_DLQ_TOPIC is missing');
if (!process.env.MONGO_URI) throw new Error('❌ MONGO_URI is missing');

export const env = {
  kafkaBroker: process.env.KAFKA_BROKER,
  kafkaDLQTopic: process.env.KAFKA_DLQ_TOPIC,
  mongoUri: process.env.MONGO_URI,
  consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'dlq-consumer-group',
};
