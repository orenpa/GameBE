import { Kafka, Consumer } from 'kafkajs';
import { env } from '../config/env';
import { LogService } from '../services/log.service';

export class LogConsumer {
  private logService: LogService;
  private consumer: Consumer;

  constructor(logService: LogService) {
    this.logService = logService;

    const kafka = new Kafka({
      clientId: 'log-worker',
      brokers: [env.kafkaBroker],
    });

    this.consumer = kafka.consumer({ groupId: env.consumerGroup });
  }

  public async start(): Promise<void> {
    await this.consumer.connect();
    console.log('✅ Kafka consumer connected');

    await this.consumer.subscribe({ topic: env.kafkaTopic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const raw = message.value.toString();
        try {
          const parsed = JSON.parse(raw);
          await this.logService.saveLog(parsed);
          console.log('📝 Processed log:', parsed);
        } catch (error) {
          console.error('❌ Failed to process log:', raw, error);
        }
      },
    });
  }

  public async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      console.log('📴 Kafka consumer disconnected');
    } catch (error) {
      console.error('⚠️ Failed to disconnect Kafka consumer:', error);
    }
  }
}
