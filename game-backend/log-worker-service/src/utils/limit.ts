import { RedisConcurrencyLimit } from './redisConcurrencyLimit';
import { env } from '../config/env';

// Create a Redis-based concurrency limiter for MongoDB writes
// This ensures that across all worker instances, we never exceed the maximum
// number of concurrent write operations
export const mongoWriteLimit = new RedisConcurrencyLimit(
  'mongodb-writes', 
  env.maxConcurrentWrites
);

// Export the run method as the main interface
export const limitConcurrency = mongoWriteLimit.run.bind(mongoWriteLimit);
