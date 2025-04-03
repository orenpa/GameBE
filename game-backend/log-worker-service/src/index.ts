import mongoose from 'mongoose';
import { env } from './config/env';
import { LogConsumer } from './consumers/log.consumer';
import { LogService } from './services/log.service';



const logService = new LogService();
const consumer = new LogConsumer(logService);

const startWorker = async () => {
  try {
    await consumer.subscribe(env.kafkaLogTopic);
    
    console.log('🧠 Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected to MongoDB');

    await consumer.start();
  } catch (error) {
    console.error('❌ Log Worker failed to start:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🔻 Shutting down gracefully...');
  await consumer.disconnect?.(); // if implemented later
  await logService.shutdown();
  await mongoose.disconnect();
  console.log('✅ Cleanup complete. Goodbye 👋');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startWorker();
