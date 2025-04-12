import redis from '../config/redis';
import { v4 as uuidv4 } from 'uuid';
import { IRedisLock } from '../interfaces/service.interfaces';

/**
 * A distributed lock implementation using Redis.
 * This ensures that only one process can perform an operation at a time,
 * preventing race conditions in a distributed environment.
 */
export class RedisLock implements IRedisLock {
  private readonly lockKey: string;
  private readonly lockValue: string;
  private readonly expirySeconds: number;
  private acquired: boolean = false;

  /**
   * Creates a new Redis lock.
   * 
   * @param resource - The name of the resource to lock
   * @param expirySeconds - How long the lock should be valid before expiring (to prevent deadlocks)
   */
  constructor(resource: string, expirySeconds = 30) {
    this.lockKey = `lock:${resource}`;
    this.lockValue = uuidv4(); // Unique identifier for this lock instance
    this.expirySeconds = expirySeconds;
  }

  /**
   * Attempts to acquire the lock.
   * 
   * @returns true if the lock was acquired, false otherwise
   */
  async acquire(): Promise<boolean> {
    // Use SET with NX option to atomically set the lock key only if it doesn't exist
    const result = await redis.set(
      this.lockKey, 
      this.lockValue,
      {
        NX: true,
        EX: this.expirySeconds
      }
    );
    
    this.acquired = result === 'OK';
    return this.acquired;
  }

  /**
   * Releases the lock if it's still owned by this instance.
   * Uses a Lua script to ensure atomicity of the check-and-release operation.
   */
  async release(): Promise<void> {
    if (!this.acquired) {
      return;
    }

    // This Lua script ensures we only delete the key if it contains our lock value
    // This prevents accidentally deleting a lock acquired by another process after ours expired
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    await redis.eval(
      script,
      {
        keys: [this.lockKey],
        arguments: [this.lockValue]
      }
    );
    
    this.acquired = false;
  }

  /**
   * Extends the lock expiry time.
   * Useful for long-running operations to prevent the lock from expiring while still in use.
   * 
   * @returns true if the lock was extended, false if it was lost
   */
  async extend(): Promise<boolean> {
    if (!this.acquired) {
      return false;
    }

    // Extend only if we still own the lock
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("expire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;

    const result = await redis.eval(
      script,
      {
        keys: [this.lockKey],
        arguments: [this.lockValue, this.expirySeconds.toString()]
      }
    );

    this.acquired = result === 1;
    return this.acquired;
  }

  /**
   * Executes a callback while holding the lock.
   * Automatically acquires the lock before executing and releases it afterward.
   * 
   * @param callback - The function to execute while holding the lock
   * @param retryDelayMs - How long to wait between lock acquisition attempts
   * @param maxRetries - Maximum number of acquisition attempts
   * @returns The result of the callback, or null if the lock couldn't be acquired
   */
  async withLock<T>(
    callback: () => Promise<T>,
    retryDelayMs = 100,
    maxRetries = 10
  ): Promise<T | null> {
    let retries = 0;
    
    // Try to acquire the lock
    while (retries < maxRetries) {
      const acquired = await this.acquire();
      
      if (acquired) {
        try {
          // Execute the callback with the lock held
          return await callback();
        } finally {
          // Always release the lock when done
          await this.release();
        }
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      retries++;
    }
    
    // Couldn't acquire the lock after maximum retries
    return null;
  }
} 