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
  private flushTimer: NodeJS.Timeout;
  private readonly kafkaProducer: IKafkaProducer;
  private readonly rateLimiter: IRateLimiter;

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
    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
    this.kafkaProducer.connect();
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
    clearInterval(this.flushTimer);
    await this.flush();
    await this.kafkaProducer.disconnect();
  }
}
