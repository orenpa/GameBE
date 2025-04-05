import { LogModel } from '../models/log.model';
import { RedisTokenBucketRateLimiter } from '../utils/redisRateLimiter';
import { Kafka } from 'kafkajs';
import { env } from '../config/env';
import { limitConcurrency } from '../utils/limit';
import { LOG_MESSAGES, LOG_CONFIG } from '../constants/log.constants';
import { REDIS_KEYS } from '../constants/redis.constants';

interface LogInput {
  playerId: string;
  logData: string;
}

export class LogService {
  private buffer: LogInput[] = [];
  private readonly batchSize = LOG_CONFIG.SERVICE.BATCH_SIZE;
  private readonly flushInterval = LOG_CONFIG.SERVICE.FLUSH_INTERVAL;
  private flushTimer: NodeJS.Timeout;
  private kafkaProducer = new Kafka({
    clientId: LOG_CONFIG.CONSUMER.CLIENT_ID,
    brokers: [env.kafkaBroker],
  }).producer();
  
  // Use Redis-based rate limiter for distributed rate limiting
  private readonly rateLimiter = new RedisTokenBucketRateLimiter(
    REDIS_KEYS.MONGODB.WRITES,
    env.maxWriteRatePerSecond,
    env.maxWriteRatePerSecond
  );

  constructor() {
    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
    this.kafkaProducer.connect();
  }

  async saveLog(log: LogInput): Promise<void> {
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
    clearInterval(this.flushTimer);
    await this.flush();
  }
}
