import app from './app';
import { env } from './config/env';
import redis from './config/redis';

const startServer = async () => {
  try {
    app.listen(env.port, () => {
      console.log(`🚀 Log API Service listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🔻 Shutting down gracefully...');
  await redis.disconnect();
  console.log('✅ Cleanup complete. Goodbye 👋');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
