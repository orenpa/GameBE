import { Kafka, Producer } from 'kafkajs';
import { env } from '../config/env';
import { IKafkaProducer } from '../interfaces/service.interfaces';
import { LOG_CONFIG } from '../constants/log.constants';

export class KafkaProducer implements IKafkaProducer {
  private producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: LOG_CONFIG.CONSUMER.CLIENT_ID,
      brokers: [env.kafkaBroker],
    });

    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async send(config: {
    topic: string;
    messages: { key: string; value: string }[];
  }): Promise<void> {
    await this.producer.send(config);
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
} 