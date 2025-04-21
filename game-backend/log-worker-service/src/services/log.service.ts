import { LogModel } from '../models/log.model';
import { RedisTokenBucketRateLimiter } from '../utils/redisRateLimiter';
import { env } from '../config/env';
import { limitConcurrency } from '../utils/limit';
import { LOG_MESSAGES, LOG_CONFIG } from '../constants/log.constants';
import { REDIS_KEYS } from '../constants/redis.constants';
import { ILogService, IRateLimiter, IKafkaProducer, LogData } from '../interfaces/service.interfaces';
import { KafkaProducer } from '../producers/kafka.producer';
import redis from '../config/redis';

export class LogService implements ILogService {
  private buffer: LogData[] = [];
  private readonly batchSize = LOG_CONFIG.SERVICE.BATCH_SIZE;
  private readonly flushInterval = LOG_CONFIG.SERVICE.FLUSH_INTERVAL;
  private flushTimeout: NodeJS.Timeout | null = null;
  private readonly kafkaProducer: IKafkaProducer;
  private readonly rateLimiter: IRateLimiter;
  private isShuttingDown: boolean = false;

  constructor(
    kafkaProducer: IKafkaProducer = new KafkaProducer(),
    rateLimiter: IRateLimiter = new RedisTokenBucketRateLimiter(
      REDIS_KEYS.MONGODB.WRITES,
      env.maxWriteRatePerSecond,
      env.maxWriteRatePerSecond
    )
  ) {
    this.kafkaProducer = kafkaProducer;
    this.rateLimiter = rateLimiter;
    this.kafkaProducer.connect();
    
    // Check for any pending logs from previous shutdowns
    this.checkPendingLogs().catch(err => console.error('Error loading pending logs:', err));
    
    this.scheduleNextFlush();
  }

  /**
   * Check for and load any pending logs saved during previous shutdowns
   */
  private async checkPendingLogs(): Promise<void> {
    try {
      // Get all pending logs
      const pendingLogCount = await redis.lLen(REDIS_KEYS.PENDING_LOGS);
      
      if (pendingLogCount > 0) {
        console.log(`Found ${pendingLogCount} pending logs from previous shutdown`);
        
        // Process logs in batches to avoid memory issues
        const batchSize = this.batchSize;
        let processed = 0;
        
        while (processed < pendingLogCount) {
          // Get a batch of logs using LPOP (left pop - FIFO order)
          const logs = await redis.lPopCount(REDIS_KEYS.PENDING_LOGS, Math.min(batchSize, pendingLogCount - processed));
          
          if (!logs || logs.length === 0) break;
          
          // Parse logs and add to buffer
          for (const logStr of logs) {
            try {
              const log = JSON.parse(logStr);
              this.buffer.push(log);
            } catch (e) {
              console.error('Failed to parse pending log:', e);
            }
          }
          
          processed += logs.length;
          
          // If buffer reaches batch size, flush it
          if (this.buffer.length >= this.batchSize) {
            await this.flush();
          }
        }
        
        console.log(`Loaded ${processed} pending logs from Redis`);
      }
    } catch (error) {
      console.error('Error checking pending logs:', error);
    }
  }

  /**
   * Schedule the next flush operation using setTimeout
   * This is more efficient than setInterval as it ensures operations don't overlap
   * and can adapt timing based on previous operation duration
   */
  private scheduleNextFlush(): void {
    if (this.isShuttingDown) return;
    
    this.flushTimeout = setTimeout(async () => {
      await this.flush();
      // Schedule next flush only if not shutting down
      if (!this.isShuttingDown) {
        this.scheduleNextFlush();
      }
    }, this.flushInterval);
  }

  async saveLog(log: LogData): Promise<void> {
    this.buffer.push(log);
    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = [...this.buffer];
    this.buffer = [];

    try {
      // Wait for rate limiter token (distributed across all workers)
      await this.rateLimiter.wait();
      
      // Use the distributed concurrency limiter to write to MongoDB
      await limitConcurrency(async () => {
        await LogModel.insertMany(batch);
      });
      
      console.log(LOG_MESSAGES.SERVICE.FLUSHED(batch.length));
    } catch (error) {
      console.error(LOG_MESSAGES.SERVICE.FLUSH_ERROR, error);
    
      const retryMessages = batch.map((log) => ({
        key: log.playerId,
        value: JSON.stringify({ ...log, retryCount: 1 }),
      }));
    
      try {
        await this.kafkaProducer.send({
          topic: env.kafkaRetryTopic,
          messages: retryMessages,
        });
    
        console.log(LOG_MESSAGES.SERVICE.RETRY_SENT(retryMessages.length));
      } catch (sendErr) {
        console.error(LOG_MESSAGES.SERVICE.RETRY_ERROR, sendErr);
      }
    }
  }

  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
    
    // Disconnect from Kafka immediately - no more processing
    await this.kafkaProducer.disconnect();
    
    // Save any in-memory messages to Redis for later processing
    if (this.buffer.length > 0) {
      try {
        // Use multi and exec for transaction
        const multi = redis.multi();
        
        // Save each log to a Redis list for later processing by this or other workers
        for (const log of this.buffer) {
          multi.rPush(REDIS_KEYS.PENDING_LOGS, JSON.stringify(log));
        }
        
        await multi.exec();
        console.log(LOG_MESSAGES.SERVICE.SAVED_TO_REDIS(this.buffer.length));
        
        // Clear the buffer after saving to Redis
        this.buffer = [];
      } catch (error) {
        console.error(LOG_MESSAGES.SERVICE.REDIS_SAVE_ERROR, error);
      }
    }
  }
}
