import redis from '../config/redis';
import { env } from '../config/env';
import { KafkaProducer } from '../producers/kafka.producer';
import { LogTypes, LogKeywords } from '../constants/log.constants';
import { RedisLock } from '../utils/redisLock';
import { hostname } from 'os';

// Generate a unique worker ID for this instance
const WORKER_ID = `${hostname()}-${process.pid}-${Date.now()}`;

interface ScoredLog {
  score: number;
  value: string;
}

/**
 * A service that batches logs in Redis and periodically flushes them to Kafka
 * This implementation uses Redis Sorted Sets for more sophisticated priority handling:
 * 1. Fine-grained priority levels based on log type
 * 2. FIFO processing within the same priority level
 * 3. Prevention of starvation for lower priority logs
 * 4. Distributed worker coordination via Redis locks
 */
export class RedisBatchService {
  private readonly kafkaProducer: KafkaProducer;
  private readonly queueKey = 'logs:priority';
  private readonly batchSize: number;
  private readonly flushIntervalMs: number;
  private flushTimer: NodeJS.Timeout;
  private isProcessing: boolean = false;
  private lastProcessTime: number = Date.now();

  constructor() {
    this.kafkaProducer = new KafkaProducer();
    this.batchSize = env.logBatchSize;
    this.flushIntervalMs = env.logBatchTimeoutMs;
    
    // Start periodic flushing
    this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
    
    // Handle graceful shutdown
    process.on('SIGINT', this.shutdown.bind(this));
    process.on('SIGTERM', this.shutdown.bind(this));
    
    console.log(`🆔 Worker initialized with ID: ${WORKER_ID}`);
  }

  /**
   * Adds a log to the Redis priority queue with appropriate score
   */
  public async addLog(log: { 
    playerId: string;
    logData: string;
    logType?: string;
  }): Promise<void> {
    // Calculate priority score (higher = more priority)
    const score = this.calculatePriorityScore(log);
    
    // Add timestamp to log for FIFO ordering within same priority
    const logWithTimestamp = {
      ...log,
      timestamp: Date.now()
    };
    
    // Add to sorted set with score
    await redis.zAdd(this.queueKey, {
      score,
      value: JSON.stringify(logWithTimestamp)
    });
    
    // Get queue length
    const queueLength = await redis.zCard(this.queueKey);
    if (queueLength >= this.batchSize && !this.isProcessing) {
      // Flush in the background
      this.flush().catch(err => console.error('Flush error:', err));
    }
  }

  /**
   * Calculate priority score based on log type and content
   * Higher scores get processed first
   */
  private calculatePriorityScore(log: { 
    playerId: string;
    logData: string;
    logType?: string;
  }): number {
    let score = 0;
    
    // Base priority by log type
    if (log.logType === LogTypes.CRASH) {
      score += 1000; // Highest priority
    } else if (log.logType === 'critical') {
      score += 900;
    } else if (log.logType === 'error') {
      score += 500;
    }
    
    // Content-based priority
    if (log.logData?.toLowerCase().includes(LogKeywords.CRITICAL)) {
      score += 800;
    }
    
    // Return negative score so higher values have higher priority
    // (Redis ZPOPMIN returns the lowest scoring members)
    return -score;
  }

  /**
   * Flushes logs from Redis to Kafka
   * Uses a distributed lock to ensure only one worker processes at a time
   */
  private async flush(): Promise<void> {
    if (this.isProcessing) {
      return; // Already processing locally
    }
    
    this.isProcessing = true;
    
    try {
      // Create a lock for the flush operation
      const lock = new RedisLock('log-batch-flush', 30); // 30 second lock timeout
      
      // Try to acquire the lock
      const acquired = await lock.acquire();
      
      if (!acquired) {
        console.log(`🔒 Another worker is processing the batch queue`);
        return; // Another worker is processing
      }
      
      console.log(`🔓 Lock acquired by worker ${WORKER_ID}`);
      
      try {
        const currentTime = Date.now();
        const timeElapsed = currentTime - this.lastProcessTime;
        
        // Process high priority logs first
        await this.flushPriorityQueue(env.kafkaHighPriorityTopic, -10000, -500); // Score range for high priority
        
        // Process low priority logs if:
        // 1. There are no more high priority logs, OR
        // 2. It's been at least 3x the flush interval since we processed low priority logs
        //    (prevents starvation of lower priority logs)
        if (timeElapsed > this.flushIntervalMs * 3) {
          await this.flushPriorityQueue(env.kafkaLowPriorityTopic, -499, 0); // Score range for low priority
          this.lastProcessTime = currentTime;
        }
      } finally {
        // Always release the lock when done
        await lock.release();
        console.log(`🔓 Lock released by worker ${WORKER_ID}`);
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Flushes logs within a specific priority range to a Kafka topic
   */
  private async flushPriorityQueue(kafkaTopic: string, minScore: number, maxScore: number): Promise<void> {
    // Get queue length within score range
    const queueLength = await redis.zCount(this.queueKey, minScore, maxScore);
    
    if (queueLength === 0) {
      return; // Nothing to process in this range
    }
    
    // Process in batches
    const batchSize = Math.min(this.batchSize, queueLength);
    
    // Use ZRANGEBYSCORE and ZREMRANGEBYSCORE to get and remove elements in a specified score range
    // First, get the elements
    const items = await redis.zRangeByScore(
      this.queueKey,
      minScore,
      maxScore,
      {
        LIMIT: {
          offset: 0,
          count: batchSize
        }
      }
    ) as string[];
    
    if (!items || items.length === 0) {
      return;
    }
    
    // Parse each JSON string into a log object and extract scores for later removal
    const logs = items.map((item: string) => {
      const parsedLog = JSON.parse(item);
      // Remove timestamp before sending to Kafka
      const { timestamp, ...logData } = parsedLog;
      return logData;
    });
    
    // Remove the processed elements
    // We're removing by value (not by score) to ensure we only remove what we processed
    await Promise.all(items.map(item => redis.zRem(this.queueKey, item)));
    
    // Send logs to Kafka
    for (const log of logs) {
      await this.kafkaProducer.sendLogToTopic(kafkaTopic, log);
    }
    
    console.log(`Worker ${WORKER_ID} sent ${logs.length} logs to Kafka topic ${kafkaTopic}`);
  }

  /**
   * Gracefully shuts down the service
   */
  public async shutdown(): Promise<void> {
    console.log(`Shutting down Redis batch service for worker ${WORKER_ID}...`);
    clearInterval(this.flushTimer);
    
    // Final flush of all logs with lock
    const lock = new RedisLock('log-batch-flush-shutdown', 60);
    const acquired = await lock.acquire();
    
    if (acquired) {
      try {
        await this.flushPriorityQueue(env.kafkaHighPriorityTopic, -10000, -500);
        await this.flushPriorityQueue(env.kafkaLowPriorityTopic, -499, 0);
      } finally {
        await lock.release();
      }
    }
    
    console.log(`Redis batch service shutdown complete for worker ${WORKER_ID}`);
  }
} 