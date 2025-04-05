import { createClient } from 'redis';
import dotenv from 'dotenv';
import { env } from './env';
import { REDIS_MESSAGES, REDIS_CONFIG } from '../constants/redis.constants';

dotenv.config();

const redis = createClient({
  url: env.redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff with max delay of 10 seconds
      return Math.min(retries * 100, REDIS_CONFIG.SOCKET.MAX_RETRY_DELAY);
    },
    connectTimeout: REDIS_CONFIG.SOCKET.CONNECT_TIMEOUT
  }
});

redis.on('error', (err) => {
  console.error(REDIS_MESSAGES.CONNECTION.ERROR, err);
});

redis.on('connect', () => {
  console.log(REDIS_MESSAGES.CONNECTION.CONNECTED);
});

redis.on('reconnecting', () => {
  console.log(REDIS_MESSAGES.CONNECTION.RECONNECTING);
});

// Connect when imported
redis.connect().catch(console.error);

export default redis; 