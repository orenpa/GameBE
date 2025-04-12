import { Kafka, Consumer } from 'kafkajs';
import { env } from '../config/env';
import { LogService } from '../services/log.service';
import { LOG_MESSAGES, LOG_CONFIG } from '../constants/log.constants';
import { CONFIG } from '../constants/config.constants';
import { ILogConsumer, ILogService } from '../interfaces/service.interfaces';

export class LogConsumer implements ILogConsumer {
  private logService: ILogService;
  private consumer: Consumer;

  constructor(logService: ILogService) {
    this.logService = logService;

    const kafka = new Kafka({
      clientId: LOG_CONFIG.CONSUMER.CLIENT_ID,
      brokers: [env.kafkaBroker],
    });

    this.consumer = kafka.consumer({ groupId: env.consumerGroup });
  }

  public async subscribe(topic: string): Promise<void> {
    await this.consumer.connect();
    console.log(LOG_MESSAGES.CONSUMER.CONNECTED(topic));

    await this.consumer.subscribe({ topic, fromBeginning: CONFIG.KAFKA.FROM_BEGINNING });
  }

  public async start(): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const raw = message.value.toString();
        try {
          const parsed = JSON.parse(raw);
          await this.logService.saveLog(parsed);
          console.log(LOG_MESSAGES.CONSUMER.PROCESSED(parsed));
        } catch (error) {
          console.error(LOG_MESSAGES.CONSUMER.PROCESS_ERROR(raw, error));
        }
      },
    });
  }

  public async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      console.log(LOG_MESSAGES.CONSUMER.DISCONNECTED);
    } catch (error) {
      console.error(LOG_MESSAGES.CONSUMER.SHUTDOWN_ERROR, error);
    }
  }
}
