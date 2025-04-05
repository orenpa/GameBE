import redis from '../config/redis';
import { REDIS_CONFIG, REDIS_PREFIXES } from '../constants/redis.constants';

/**
 * A distributed token bucket rate limiter that uses Redis for coordination across multiple instances.
 * This ensures that all worker instances share the same rate limit.
 */
export class RedisTokenBucketRateLimiter {
  private readonly key: string;
  private readonly capacity: number;
  private readonly refillRatePerSecond: number;

  /**
   * Creates a new Redis-based token bucket rate limiter.
   * 
   * @param key - A unique identifier for this rate limiter
   * @param capacity - Maximum number of tokens in the bucket
   * @param refillRatePerSecond - How many tokens to add per second
   */
  constructor(key: string, capacity: number, refillRatePerSecond: number) {
    this.key = `${REDIS_PREFIXES.RATE_LIMITER}${key}`;
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
  }

  /**
   * Wait until a token is available and then consume it.
   * This method will block until a token becomes available.
   */
  public async wait(): Promise<void> {
    // Try to acquire a token
    let acquired = false;
    while (!acquired) {
      const result = await redis.eval(
        REDIS_CONFIG.RATE_LIMITER.LUA_SCRIPT,
        {
          keys: [this.key],
          arguments: [Date.now().toString(), this.capacity.toString(), this.refillRatePerSecond.toString()]
        }
      );
      
      acquired = result === 1;
      
      if (!acquired) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, REDIS_CONFIG.RATE_LIMITER.RETRY_DELAY));
      }
    }
  }
} 