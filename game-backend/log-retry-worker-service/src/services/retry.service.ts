import { Kafka } from 'kafkajs';
import { env } from '../config/env';
import { LogModel } from '../models/log.model';
import { mongoWriteLimit } from '../utils/limit';
import { RedisTokenBucketRateLimiter } from '../utils/redisRateLimiter';


interface RetryLog {
  playerId: string;
  logData: string;
  retryCount?: number;
}

export class RetryService {
  private producer;
  // Use Redis-based rate limiter for distributed rate limiting
  private rateLimiter = new RedisTokenBucketRateLimiter(
    'retry-mongodb-writes', 
    env.maxWriteRatePerSecond, 
    env.maxWriteRatePerSecond
  );

  constructor() {
    const kafka = new Kafka({
      clientId: 'retry-service-producer',
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
      
      // Write to MongoDB with concurrency limit
      await mongoWriteLimit(() =>
        LogModel.create({
          playerId: log.playerId,
          logData: log.logData,
        })
      );
      

      console.log(`✅ Retry succeeded for player ${log.playerId}`);
    } catch (error) {
      console.warn(`⚠️ Retry failed (count: ${retryCount})`, error);

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
    console.log(`🔁 Requeued log for retry (count: ${log.retryCount})`);
  }

  private async sendToDLQ(log: RetryLog): Promise<void> {
    await this.producer.send({
      topic: env.kafkaDLQTopic,
      messages: [{ key: log.playerId, value: JSON.stringify(log) }],
    });
    console.log(`💀 Sent log to DLQ for player ${log.playerId}`);
  }
}
