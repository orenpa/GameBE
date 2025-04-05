import mongoose from 'mongoose';
import { env } from './config/env';
import { RetryConsumer } from './consumers/retry.consumer';
import redis from './config/redis';
import { SYSTEM_MESSAGES } from './constants/system.constants';

const consumer = new RetryConsumer();

const start = async () => {
  try {
    console.log(SYSTEM_MESSAGES.STARTUP.CONNECTING_MONGODB);
    await mongoose.connect(env.mongoUri);
    console.log(SYSTEM_MESSAGES.STARTUP.CONNECTED_MONGODB);

    await consumer.start();
  } catch (error) {
    console.error(SYSTEM_MESSAGES.STARTUP.FAILED_STARTUP, error);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log(SYSTEM_MESSAGES.SHUTDOWN.STARTED);
  await consumer.disconnect();
  await mongoose.disconnect();
  await redis.disconnect();
  console.log(SYSTEM_MESSAGES.SHUTDOWN.COMPLETE);
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
