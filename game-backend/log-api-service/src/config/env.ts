import dotenv from 'dotenv';
dotenv.config();

if (!process.env.KAFKA_BROKER) {
  throw new Error('❌ KAFKA_BROKER is not defined in .env');
}

export const env = {
  port: process.env.PORT || 3004,
  kafkaBroker: process.env.KAFKA_BROKER,
  kafkaTopic: process.env.KAFKA_TOPIC || 'log-events',
};
