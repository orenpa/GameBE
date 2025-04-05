import { RedisConcurrencyLimit } from './redisConcurrencyLimit';
import { env } from '../config/env';
import { REDIS_KEYS } from '../constants/redis.constants';

// Create a Redis-based concurrency limiter for MongoDB writes
// This ensures that across all worker instances, we never exceed the maximum
// number of concurrent write operations
export const mongoWriteLimit = new RedisConcurrencyLimit(
  REDIS_KEYS.MONGODB.WRITES,
  env.maxConcurrentWrites
);

// Export the run method as the main interface
export const limitConcurrency = mongoWriteLimit.run.bind(mongoWriteLimit);
