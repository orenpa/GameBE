import { LogModel } from '../models/log.model';
import { TokenBucketRateLimiter } from '../utils/rateLimiter';
import { Kafka } from 'kafkajs';
import { env } from '../config/env'; // assuming you have access to env.KAFKA_RETRY_TOPIC
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
  

  private readonly rateLimiter = new TokenBucketRateLimiter(20, 20); 

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

    const maxRetries = 3;
    let attempt = 0;

    try {
      await this.rateLimiter.wait();
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
    

    console.error(`❌ Failed to flush ${batch.length} logs after ${maxRetries} attempts.`);
  }

  async shutdown(): Promise<void> {
    clearInterval(this.flushTimer);
    await this.flush();
  }
}
