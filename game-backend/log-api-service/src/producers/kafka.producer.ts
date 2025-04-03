import { Kafka, Producer } from 'kafkajs';
import { env } from '../config/env';

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
    await this.producer.connect();
  }

  public async sendLogToTopic(topic: string, log: { playerId: string; logData: string; logType?: string }) {
    await this.producer.send({
      topic,
      messages: [
        {
          key: log.playerId,
          value: JSON.stringify(log),
        },
      ],
    });
  }
}
