import mongoose from 'mongoose';
import { env } from './config/env';
import { DlqConsumer } from './consumers/dlq.consumer';

const consumer = new DlqConsumer();

const start = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected to MongoDB');

    await consumer.start();
  } catch (error) {
    console.error('❌ Failed to start DLQ service:', error);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log('\n🛑 Shutting down DLQ service...');
  await consumer.disconnect();
  await mongoose.disconnect();
  console.log('✅ DLQ service shutdown complete');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
