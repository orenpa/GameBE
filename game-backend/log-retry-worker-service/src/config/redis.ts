import { createClient } from 'redis';
import dotenv from 'dotenv';
import { env } from './env';

dotenv.config();

const redis = createClient({
  url: env.redisUrl || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff with max delay of 10 seconds
      return Math.min(retries * 100, 10000);
    },
    connectTimeout: 10000
  }
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('reconnecting', () => {
  console.log('⏳ Reconnecting to Redis...');
});

// Connect when imported
redis.connect().catch(console.error);

export default redis; 