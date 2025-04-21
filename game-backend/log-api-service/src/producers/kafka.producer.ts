import { Kafka, Producer } from 'kafkajs';
import { env } from '../config/env';
import { KAFKA_CONFIG, KAFKA_MESSAGES } from '../constants/kafka.constants';
import { IKafkaProducer, LogEntry } from '../interfaces/service.interfaces';

export class KafkaProducer implements IKafkaProducer {
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

  public async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      console.log(KAFKA_MESSAGES.DISCONNECT_SUCCESS);
    } catch (error) {
      console.error(KAFKA_MESSAGES.DISCONNECT_FAILED, error);
    }
  }

  public async sendLogToTopic(topic: string, log: LogEntry): Promise<void> {
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

  /**
   * Send a batch of logs to Kafka in a single request
   * This is more efficient than sending logs one by one
   */
  public async sendLogBatchToTopic(topic: string, logs: LogEntry[]): Promise<void> {
    if (!logs || logs.length === 0) return;
    
    try {
      const messages = logs.map(log => ({
        key: log.playerId,
        value: JSON.stringify(log),
      }));
      
      await this.producer.send({
        topic,
        messages,
      });
      
      console.log(KAFKA_MESSAGES.BATCH_SEND_SUCCESS(logs.length));
    } catch (error) {
      console.error(KAFKA_MESSAGES.BATCH_SEND_FAILED, error);
      throw error;
    }
  }
}
