import { LogModel } from '../models/log.model';
import { RedisTokenBucketRateLimiter } from '../utils/redisRateLimiter';
import { Kafka } from 'kafkajs';
import { env } from '../config/env'; 
import { mongoWriteLimit } from '../utils/limit';

interface LogInput {
  playerId: string;
  logData: string;
}
export class LogService {
  private buffer: LogInput[] = [];
  private readonly batchSize = 10;
  private readonly flushInterval = 2000; // ms
  private flushTimer: NodeJS.Timeout;
  private kafkaProducer = new Kafka({
    clientId: 'log-worker',
    brokers: [env.kafkaBroker],
  }).producer();
  
  // Use Redis-based rate limiter for distributed rate limiting
  private readonly rateLimiter = new RedisTokenBucketRateLimiter(
    'mongodb-writes', 
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
      
      // Write to MongoDB with concurrency limit
      await mongoWriteLimit(() =>
        LogModel.insertMany(batch)
      );
      console.log(`✅ Flushed ${batch.length} logs to MongoDB`);
    } catch (error) {
      console.error(`❌ Failed to flush batch. Sending to retry queue.`, error);
    
      const retryMessages = batch.map((log) => ({
        key: log.playerId,
        value: JSON.stringify({ ...log, retryCount: 1 }),
      }));
    
      try {
        await this.kafkaProducer.send({
          topic: env.kafkaRetryTopic,
          messages: retryMessages,
        });
    
        console.log(`🔁 Sent ${retryMessages.length} logs to retry queue`);
      } catch (sendErr) {
        console.error('❌ Failed to send logs to retry topic:', sendErr);
      }
    }
  }

  async shutdown(): Promise<void> {
    clearInterval(this.flushTimer);
    await this.flush();
  }
}
