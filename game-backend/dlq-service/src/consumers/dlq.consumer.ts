import { Kafka, Consumer } from 'kafkajs';
import { env } from '../config/env';
import { DLQ_MESSAGES, DLQ_CONFIG } from '../constants/dlq.constants';
import { IDlqConsumer, IDlqRepository, DlqLogEntry } from '../interfaces/service.interfaces';
import { DlqRepository } from '../repositories/dlq.repository';

export class DlqConsumer implements IDlqConsumer {
  private consumer: Consumer;
  private dlqRepository: IDlqRepository;

  constructor(dlqRepository: IDlqRepository = new DlqRepository()) {
    const kafka = new Kafka({
      clientId: DLQ_CONFIG.CLIENT_ID,
      brokers: [env.kafkaBroker],
    });

    this.consumer = kafka.consumer({ groupId: env.consumerGroup });
    this.dlqRepository = dlqRepository;
  }

  public async start(): Promise<void> {
    await this.consumer.connect();
    console.log(DLQ_MESSAGES.CONSUMER.CONNECTED);

    await this.consumer.subscribe({ topic: env.kafkaDLQTopic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const raw = message.value.toString();

        try {
          const parsed = JSON.parse(raw) as DlqLogEntry;
          await this.dlqRepository.saveDlqLog(parsed);
        } catch (error) {
          console.error(DLQ_MESSAGES.LOG.INSERT_ERROR, raw, error);
        }
      },
    });
  }

  public async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      console.log(DLQ_MESSAGES.CONSUMER.DISCONNECTED);
    } catch (error) {
      console.error(DLQ_MESSAGES.CONSUMER.SHUTDOWN_ERROR, error);
    }
  }
}
