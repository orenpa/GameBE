import { Kafka, Producer } from 'kafkajs';
import { env } from '../config/env';
import { KAFKA_CONFIG, KAFKA_MESSAGES } from '../constants/kafka.constants';

export class KafkaProducer {
  private producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: KAFKA_CONFIG.CLIENT_ID,
      brokers: [env.kafkaBroker],
    });

    this.producer = kafka.producer();
    this.connect();
  }

  private async connect() {
    await this.producer.connect();
  }

  public async sendLogToTopic(topic: string, log: { playerId: string; logData: string; logType?: string }) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: log.playerId,
            value: JSON.stringify(log),
          },
        ],
      });
      console.log(KAFKA_MESSAGES.SEND_SUCCESS);
    } catch (error) {
      console.error(KAFKA_MESSAGES.SEND_FAILED, error);
      throw error;
    }
  }
}
