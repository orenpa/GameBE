import { createClient } from 'redis';
import dotenv from 'dotenv';
import { env } from './env';
import { REDIS_CONFIG, REDIS_MESSAGES } from '../constants/redis.constants';

dotenv.config();

const redis = createClient({
  url: env.redisUrl || REDIS_CONFIG.DEFAULT_URL,
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff with max delay
      return Math.min(retries * REDIS_CONFIG.CONCURRENCY.RETRY_MULTIPLIER, REDIS_CONFIG.SOCKET.MAX_RETRY_DELAY);
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