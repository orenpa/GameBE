import { Kafka, Producer } from 'kafkajs';
import { env } from '../config/env';

export interface LogMessage {
  playerId: string;
  logData: string;
}

export class KafkaProducer {
  private producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: 'log-api-producer',
      brokers: [env.kafkaBroker],
    });

    this.producer = kafka.producer();
    this.connect();
  }

  private async connect() {
    try {
      await this.producer.connect();
      console.log('✅ Kafka producer connected');
    } catch (error) {
      console.error('❌ Kafka producer connection failed:', error);
    }
  }

  async sendLog(message: LogMessage): Promise<void> {
    await this.producer.send({
      topic: env.kafkaTopic,
      messages: [
        {
          key: message.playerId,
          value: JSON.stringify(message),
        },
      ],
    });
  }
}
