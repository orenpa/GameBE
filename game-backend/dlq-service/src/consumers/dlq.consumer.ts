import { Kafka, Consumer } from 'kafkajs';
import { env } from '../config/env';
import { DlqLogModel } from '../models/dlq-log.model';

export class DlqConsumer {
  private consumer: Consumer;

  constructor() {
    const kafka = new Kafka({
      clientId: 'dlq-consumer',
      brokers: [env.kafkaBroker],
    });

    this.consumer = kafka.consumer({ groupId: env.consumerGroup });
  }

  public async start(): Promise<void> {
    await this.consumer.connect();
    console.log('📥 DLQ Consumer connected');

    await this.consumer.subscribe({ topic: env.kafkaDLQTopic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const raw = message.value.toString();

        try {
          const parsed = JSON.parse(raw);
          await DlqLogModel.create(parsed);
          console.log(`💾 DLQ log stored: ${parsed.playerId} (retryCount: ${parsed.retryCount})`);
        } catch (error) {
          console.error('❌ Failed to insert DLQ message:', raw, error);
        }
      },
    });
  }

  public async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      console.log('📴 DLQ consumer disconnected');
    } catch (error) {
      console.error('⚠️ Error during DLQ consumer shutdown:', error);
    }
  }
}
