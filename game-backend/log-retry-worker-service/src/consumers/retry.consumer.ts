import { Kafka, Consumer } from 'kafkajs';
import { env } from '../config/env';
import { RetryService } from '../services/retry.service';

export class RetryConsumer {
  private consumer: Consumer;
  private retryService: RetryService;

  constructor() {
    const kafka = new Kafka({
      clientId: 'log-retry-worker',
      brokers: [env.kafkaBroker],
    });

    this.consumer = kafka.consumer({ groupId: env.consumerGroup });
    this.retryService = new RetryService();
  }

  public async start(): Promise<void> {
    await this.consumer.connect();
    console.log('🔁 Kafka retry consumer connected');

    await this.consumer.subscribe({ topic: env.kafkaRetryTopic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const raw = message.value.toString();

        try {
          const parsed = JSON.parse(raw);
          await this.retryService.handleRetry(parsed);
        } catch (error) {
          console.error('❌ Failed to handle retry message:', raw, error);
        }
      },
    });
  }

  public async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      console.log('📴 Kafka retry consumer disconnected');
    } catch (error) {
      console.error('⚠️ Failed to disconnect retry consumer:', error);
    }
  }
}
