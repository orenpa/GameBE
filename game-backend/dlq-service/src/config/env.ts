import dotenv from 'dotenv';
import { SYSTEM_MESSAGES } from '../constants/system.constants';
import { DLQ_CONFIG } from '../constants/dlq.constants';

dotenv.config();

if (!process.env.KAFKA_BROKER) throw new Error(SYSTEM_MESSAGES.ERROR.ENV_MISSING('KAFKA_BROKER'));
if (!process.env.KAFKA_DLQ_TOPIC) throw new Error(SYSTEM_MESSAGES.ERROR.ENV_MISSING('KAFKA_DLQ_TOPIC'));
if (!process.env.MONGO_URI) throw new Error(SYSTEM_MESSAGES.ERROR.ENV_MISSING('MONGO_URI'));

export const env = {
  kafkaBroker: process.env.KAFKA_BROKER,
  kafkaDLQTopic: process.env.KAFKA_DLQ_TOPIC,
  mongoUri: process.env.MONGO_URI,
  consumerGroup: process.env.KAFKA_CONSUMER_GROUP || DLQ_CONFIG.CONSUMER_GROUP,
};
