import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.connect();

export default redis;
