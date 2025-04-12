import redis from '../config/redis';
import { env } from '../config/env';
import { KafkaProducer } from '../producers/kafka.producer';
import { LOG_TYPES, LOG_KEYWORDS } from '../constants/log.constants';
import { REDIS_KEYS, BATCH_SCORES, BATCH_TIMES, REDIS_MESSAGES } from '../constants/redis.constants';
import { RedisLock } from '../utils/redisLock';
import { hostname } from 'os';
import { IKafkaProducer, IRedisBatchService, LogEntry } from '../interfaces/service.interfaces';

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
export class RedisBatchService implements IRedisBatchService {
  private readonly kafkaProducer: IKafkaProducer;
  private readonly queueKey = REDIS_KEYS.LOGS_QUEUE;
  private readonly batchSize: number;
  private readonly flushIntervalMs: number;
  private flushTimer: NodeJS.Timeout;
  private isProcessing: boolean = false;
  private lastProcessTime: number = Date.now();

  constructor(kafkaProducer: IKafkaProducer = new KafkaProducer()) {
    this.kafkaProducer = kafkaProducer;
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
  public async addLog(log: LogEntry): Promise<void> {
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
  private calculatePriorityScore(log: LogEntry): number {
    let score = BATCH_SCORES.DEFAULT;
    
    // Base score on log type
    if (log.logType === LOG_TYPES.CRASH) {
      score = BATCH_SCORES.CRASH;
    } else if (log.logType === LOG_TYPES.ERROR) {
      score = BATCH_SCORES.ERROR;
    }
    
    // Additional score boost for critical logs
    if (log.logData?.toLowerCase().includes(LOG_KEYWORDS.CRITICAL)) {
      score = Math.min(score, BATCH_SCORES.CRITICAL_BOOST);
    }
    
    return score;
  }

  /**
   * Flushes logs from Redis to Kafka
   * Uses a distributed lock to ensure only one worker processes at a time
   */
  private async flush(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      const lock = new RedisLock(REDIS_KEYS.BATCH_FLUSH_LOCK, BATCH_TIMES.LOCK_TIMEOUT);
      const acquired = await lock.acquire();
      
      if (!acquired) {
        console.log(REDIS_MESSAGES.BATCH.ANOTHER_WORKER);
        return;
      }
      
      console.log(REDIS_MESSAGES.BATCH.LOCK_ACQUIRED(WORKER_ID));
      
      try {
        const currentTime = Date.now();
        const timeElapsed = currentTime - this.lastProcessTime;
        
        // Process high priority logs first
        await this.processBatch(env.kafkaHighPriorityTopic);
        
        // Process low priority logs if enough time has passed
        if (timeElapsed > this.flushIntervalMs * BATCH_TIMES.LOW_PRIORITY_MULTIPLIER) {
          await this.processBatch(env.kafkaLowPriorityTopic);
          this.lastProcessTime = currentTime;
        }
      } finally {
        await lock.release();
        console.log(REDIS_MESSAGES.BATCH.LOCK_RELEASED(WORKER_ID));
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Flushes logs within a specific priority range to a Kafka topic
   */
  private async processBatch(kafkaTopic: string): Promise<void> {
    // Get queue length
    const queueLength = await redis.zCard(this.queueKey);
    
    if (queueLength === 0) {
      return; // Nothing to process
    }
    
    // Process in batches
    const batchSize = Math.min(this.batchSize, queueLength);
    
    try {
      // Use ZPOPMIN to get and remove the lowest scoring elements (highest priority)
      const items = await redis.sendCommand(['ZPOPMIN', this.queueKey, batchSize.toString()]);
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return;
      }
      
      // Parse result: [value1, score1, value2, score2, ...]
      const logs = [];
      for (let i = 0; i < items.length; i += 2) {
        const item = items[i];
        if (item !== null && item !== undefined) {
          const value = item.toString();
          try {
            const parsedLog = JSON.parse(value);
            // Remove timestamp before sending to Kafka
            const { timestamp, ...logData } = parsedLog;
            logs.push(logData);
          } catch (e) {
            console.error(REDIS_MESSAGES.BATCH.PARSE_ERROR, e);
          }
        }
      }
      
      // Send logs to Kafka
      for (const log of logs) {
        await this.kafkaProducer.sendLogToTopic(kafkaTopic, log);
      }
      
      console.log(REDIS_MESSAGES.BATCH.SENT_LOGS(WORKER_ID, logs.length, kafkaTopic));
    } catch (error) {
      console.error(REDIS_MESSAGES.BATCH.PROCESSING_ERROR, error);
    }
  }

  /**
   * Gracefully shuts down the service
   */
  public async shutdown(): Promise<void> {
    console.log(REDIS_MESSAGES.SHUTDOWN.STARTED(WORKER_ID));
    clearInterval(this.flushTimer);
    
    // Final flush of all logs with lock
    const lock = new RedisLock(REDIS_KEYS.SHUTDOWN_LOCK, BATCH_TIMES.SHUTDOWN_LOCK_TIMEOUT);
    const acquired = await lock.acquire();
    
    if (acquired) {
      try {
        await this.processBatch(env.kafkaHighPriorityTopic);
        await this.processBatch(env.kafkaLowPriorityTopic);
      } finally {
        await lock.release();
      }
    }
    
    console.log(REDIS_MESSAGES.SHUTDOWN.COMPLETE(WORKER_ID));
  }
} 