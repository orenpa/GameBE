import { LogModel } from '../models/log.model';
import { RedisTokenBucketRateLimiter } from '../utils/redisRateLimiter';
import { env } from '../config/env';
import { limitConcurrency } from '../utils/limit';
import { LOG_MESSAGES, LOG_CONFIG } from '../constants/log.constants';
import { REDIS_KEYS } from '../constants/redis.constants';
import { ILogService, IRateLimiter, IKafkaProducer, LogData } from '../interfaces/service.interfaces';
import { KafkaProducer } from '../producers/kafka.producer';

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
    this.scheduleNextFlush();
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
    
    // Ensure final flush of any remaining logs
    await this.flush();
    
    // Disconnect from Kafka after all logs have been processed
    await this.kafkaProducer.disconnect();
  }
}
