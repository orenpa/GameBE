export const REDIS_MESSAGES = {
  CONNECTION: {
    ERROR: 'Redis connection error:',
    CONNECTED: 'Connected to Redis',
    RECONNECTING: 'Reconnecting to Redis...',
  },
};

export const REDIS_CONFIG = {
  DEFAULT_URL: 'redis://localhost:6379',
  DOCKER_URL: 'redis://redis:6379',
  SOCKET: {
    MAX_RETRY_DELAY: 10000, // ms
    CONNECT_TIMEOUT: 10000, // ms
  },
  RATE_LIMITER: {
    LUA_SCRIPT: `
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
    `,
    RETRY_DELAY: 50, // ms
    TTL_SECONDS: 60,
  },
  CONCURRENCY: {
    RETRY_MULTIPLIER: 100,
    LOCK_TIMEOUT_SECONDS: 60,
    EXPONENTIAL_BACKOFF_BASE: 1.5,
    MAX_RETRY_DELAY: 5000, // ms
  },
};

export const REDIS_KEYS = {
  MONGODB: {
    WRITES: 'retry-mongodb-writes',
  },
};

export const REDIS_PREFIXES = {
  RATE_LIMITER: 'rate-limiter:',
  SEMAPHORE: 'semaphore:',
}; 