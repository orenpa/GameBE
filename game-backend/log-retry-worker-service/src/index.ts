import mongoose from 'mongoose';
import { env } from './config/env';
import { RetryConsumer } from './consumers/retry.consumer';
import redis from './config/redis';

const consumer = new RetryConsumer();

const start = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected to MongoDB');

    await consumer.start();
  } catch (error) {
    console.error('❌ Failed to start log-retry-worker:', error);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log('\n🛑 Shutting down log-retry-worker...');
  await consumer.disconnect();
  await mongoose.disconnect();
  await redis.disconnect();
  console.log('✅ Shutdown complete. Goodbye 👋');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
