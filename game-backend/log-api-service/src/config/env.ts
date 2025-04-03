import dotenv from 'dotenv';
dotenv.config();

if (!process.env.KAFKA_BROKER) throw new Error('Missing KAFKA_BROKER');
if (!process.env.KAFKA_HIGH_PRIORITY_TOPIC) throw new Error('Missing KAFKA_HIGH_PRIORITY_TOPIC');
if (!process.env.KAFKA_LOW_PRIORITY_TOPIC) throw new Error('Missing KAFKA_LOW_PRIORITY_TOPIC');

export const env = {
  port: parseInt(process.env.PORT || '3004', 10),
  kafkaBroker: process.env.KAFKA_BROKER,
  kafkaHighPriorityTopic: process.env.KAFKA_HIGH_PRIORITY_TOPIC,
  kafkaLowPriorityTopic: process.env.KAFKA_LOW_PRIORITY_TOPIC,
};
