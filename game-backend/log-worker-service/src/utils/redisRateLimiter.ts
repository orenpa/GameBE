import redis from '../config/redis';

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
    this.key = `rate-limiter:${key}`;
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
  }

  /**
   * Wait until a token is available and then consume it.
   * This method will block until a token becomes available.
   */
  public async wait(): Promise<void> {
    // Lua script for atomic token bucket algorithm
    const luaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local capacity = tonumber(ARGV[2])
      local refillRate = tonumber(ARGV[3])
      
      -- Get current bucket state or initialize
      local bucket = redis.call('hmget', key, 'tokens', 'lastRefill')
      local tokens = tonumber(bucket[1]) or capacity
      local lastRefill = tonumber(bucket[2]) or now
      
      -- Calculate time since last refill and new tokens
      local timePassed = math.max(0, now - lastRefill)
      local newTokens = math.min(capacity, tokens + (timePassed * refillRate / 1000))
      
      -- If we have at least one token, consume it
      if newTokens >= 1 then
        -- Update bucket state
        redis.call('hmset', key, 'tokens', newTokens - 1, 'lastRefill', now)
        redis.call('expire', key, 60) -- TTL for cleanup
        return 1 -- Success, token consumed
      else
        -- Keep bucket state but don't consume
        redis.call('hmset', key, 'tokens', newTokens, 'lastRefill', now)
        redis.call('expire', key, 60) -- TTL for cleanup
        return 0 -- No tokens available
      end
    `;

    // Try to acquire a token
    let acquired = false;
    while (!acquired) {
      const result = await redis.eval(
        luaScript,
        {
          keys: [this.key],
          arguments: [Date.now().toString(), this.capacity.toString(), this.refillRatePerSecond.toString()]
        }
      );
      
      acquired = result === 1;
      
      if (!acquired) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }
} 