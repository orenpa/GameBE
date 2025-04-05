import { Kafka } from 'kafkajs';
import { env } from '../config/env';
import { LogModel } from '../models/log.model';
import { limitConcurrency } from '../utils/limit';
import { RedisTokenBucketRateLimiter } from '../utils/redisRateLimiter';
import { LOG_CONSTANTS, LOG_MESSAGES } from '../constants/log.constants';
import { RetryLog } from '../interfaces/retry.interface';

export class RetryService {
  private producer;
  // Use Redis-based rate limiter for distributed rate limiting
  private rateLimiter = new RedisTokenBucketRateLimiter(
    LOG_CONSTANTS.RATE_LIMITER.KEY,
    env.maxWriteRatePerSecond, 
    env.maxWriteRatePerSecond
  );

  constructor() {
    const kafka = new Kafka({
      clientId: LOG_CONSTANTS.CLIENT_IDS.PRODUCER,
      brokers: [env.kafkaBroker],
    });

    this.producer = kafka.producer();
    this.producer.connect();
  }

  async handleRetry(log: RetryLog): Promise<void> {
    const retryCount = log.retryCount || 0;

    try {
      // Wait for rate limiter token (distributed across all worker instances)
      await this.rateLimiter.wait();
      
      // Use the distributed concurrency limiter to write to MongoDB
      await limitConcurrency(async () => {
        await LogModel.create({
          playerId: log.playerId,
          logData: log.logData,
        });
      });
      
      console.log(LOG_MESSAGES.SUCCESS.RETRY_SUCCEEDED(log.playerId));
    } catch (error) {
      console.warn(LOG_MESSAGES.ERROR.RETRY_FAILED(retryCount), error);

      if (retryCount + 1 >= env.maxRetries) {
        // Send to DLQ
        await this.sendToDLQ({ ...log, retryCount: retryCount + 1 });
      } else {
        // Retry again later
        await this.sendToRetryQueue({ ...log, retryCount: retryCount + 1 });
      }
    }
  }

  private async sendToRetryQueue(log: RetryLog): Promise<void> {
    await this.producer.send({
      topic: env.kafkaRetryTopic,
      messages: [{ key: log.playerId, value: JSON.stringify(log) }],
    });
    console.log(LOG_MESSAGES.INFO.REQUEUED(log.retryCount || 0));
  }

  private async sendToDLQ(log: RetryLog): Promise<void> {
    await this.producer.send({
      topic: env.kafkaDLQTopic,
      messages: [{ key: log.playerId, value: JSON.stringify(log) }],
    });
    console.log(LOG_MESSAGES.INFO.SENT_TO_DLQ(log.playerId));
  }
}
