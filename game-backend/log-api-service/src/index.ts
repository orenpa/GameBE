import app from './app';
import { env } from './config/env';
import redis from './config/redis';
import { SERVER_MESSAGES } from './constants/general.constants';
import { ERROR_MESSAGES } from './constants/error.constants';
import { serviceFactory } from './factories/service.factory';

// Get the log batch service instance
const logBatchService = serviceFactory.createLogBatchService();

const startServer = async () => {
  try {
    app.listen(env.port, () => {
      console.log(SERVER_MESSAGES.SERVER_LISTENING(env.port));
    });
  } catch (error) {
    console.error(ERROR_MESSAGES.SERVER.FAILED_START, error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log(SERVER_MESSAGES.SHUTTING_DOWN);
  
  // Shutdown the log batch service first to ensure logs are flushed
  await logBatchService.shutdown();
  
  // Disconnect from Redis
  await redis.disconnect();
  
  console.log(SERVER_MESSAGES.SHUTDOWN_COMPLETE);
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
