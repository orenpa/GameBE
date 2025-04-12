import { env } from '../config/env';
import { LogModel } from '../models/log.model';
import { limitConcurrency } from '../utils/limit';
import { RedisTokenBucketRateLimiter } from '../utils/redisRateLimiter';
import { LOG_CONSTANTS, LOG_MESSAGES } from '../constants/log.constants';
import { RetryLog } from '../interfaces/retry.interface';
import { IRetryService, IRateLimiter, IKafkaProducer } from '../interfaces/service.interfaces';
import { KafkaProducer } from '../producers/kafka.producer';

export class RetryService implements IRetryService {
  private producer: IKafkaProducer;
  private rateLimiter: IRateLimiter;

  constructor(
    producer: IKafkaProducer = new KafkaProducer(),
    rateLimiter: IRateLimiter = new RedisTokenBucketRateLimiter(
      LOG_CONSTANTS.RATE_LIMITER.KEY,
      env.maxWriteRatePerSecond, 
      env.maxWriteRatePerSecond
    )
  ) {
    this.producer = producer;
    this.rateLimiter = rateLimiter;
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

  async shutdown(): Promise<void> {
    await this.producer.disconnect();
  }
}
