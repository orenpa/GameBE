import redis from '../config/redis';
import { v4 as uuidv4 } from 'uuid';
import { REDIS_CONFIG, REDIS_PREFIXES, REDIS_MESSAGES } from '../constants/redis.constants';

/**
 * A distributed concurrency limiter that uses Redis to coordinate across multiple service instances.
 * This ensures that the total number of concurrent operations across all instances is limited.
 */
export class RedisConcurrencyLimit {
  private readonly key: string;
  private readonly limit: number;
  private readonly lockTimeout: number;

  /**
   * Creates a new Redis-based concurrency limiter.
   * 
   * @param resourceName - A unique name for the resource being limited
   * @param limit - Maximum number of concurrent operations allowed across all instances
   * @param lockTimeoutSeconds - Maximum time in seconds before a lock is automatically released
   *                            (prevents deadlocks if a process crashes)
   */
  constructor(resourceName: string, limit: number, lockTimeoutSeconds = REDIS_CONFIG.CONCURRENCY.LOCK_TIMEOUT_SECONDS) {
    this.key = `${REDIS_PREFIXES.SEMAPHORE}${resourceName}`;
    this.limit = limit;
    this.lockTimeout = lockTimeoutSeconds;
  }

  /**
   * Tries to acquire a slot in the concurrency limit.
   * Returns a token if successful, null if the limit is reached.
   */
  public async acquire(): Promise<string | null> {
    try {
      const token = uuidv4();
      
      // Get the current count of active operations
      const count = await redis.sCard(this.key);
      
      if (count < this.limit) {
        // Add the token to the set with an expiry
        await redis.sAdd(this.key, token);
        
        // Set expiration for automatic cleanup in case of crashes
        await redis.expire(this.key, this.lockTimeout);
        
        // Also set a per-token expiration key to handle individual timeouts
        await redis.set(`${this.key}:${token}`, '1', { EX: this.lockTimeout });
        
        return token;
      }
      
      return null; // No slot available
    } catch (error) {
      console.error(REDIS_MESSAGES.CONNECTION.ERROR, error);
      throw error;
    }
  }

  /**
   * Releases a previously acquired concurrency slot.
   */
  public async release(token: string): Promise<void> {
    try {
      await redis.sRem(this.key, token);
      await redis.del(`${this.key}:${token}`);
    } catch (error) {
      console.error(REDIS_MESSAGES.CONNECTION.ERROR, error);
      throw error;
    }
  }
  
  /**
   * Executes a function while holding a concurrency slot.
   * The function will only be executed once a slot becomes available.
   * The slot is automatically released when the function completes or throws an error.
   */
  public async run<T>(fn: () => Promise<T>): Promise<T> {
    let token: string | null = null;
    let retryCount = 0;
    
    // Try to acquire a slot with exponential backoff
    while (token === null) {
      token = await this.acquire();
      
      if (token === null) {
        // No slot available, wait with exponential backoff
        const waitTime = Math.min(
          REDIS_CONFIG.CONCURRENCY.RETRY_MULTIPLIER * 
          Math.pow(REDIS_CONFIG.CONCURRENCY.EXPONENTIAL_BACKOFF_BASE, retryCount),
          REDIS_CONFIG.CONCURRENCY.MAX_RETRY_DELAY
        );
        await new Promise(resolve => setTimeout(resolve, waitTime));
        retryCount++;
      }
    }
    
    try {
      // Execute the function with the acquired slot
      return await fn();
    } finally {
      // Always release the slot, even if the function throws an error
      await this.release(token);
    }
  }
} 