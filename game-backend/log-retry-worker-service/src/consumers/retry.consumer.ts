import { Kafka, Consumer } from 'kafkajs';
import { env } from '../config/env';
import { RetryService } from '../services/retry.service';
import { LOG_CONSTANTS, LOG_MESSAGES } from '../constants/log.constants';
import { RetryLog } from '../interfaces/retry.interface';
import { IRetryConsumer, IRetryService } from '../interfaces/service.interfaces';

export class RetryConsumer implements IRetryConsumer {
  private consumer: Consumer;
  private retryService: IRetryService;

  constructor(retryService: IRetryService = new RetryService()) {
    const kafka = new Kafka({
      clientId: LOG_CONSTANTS.CLIENT_IDS.CONSUMER,
      brokers: [env.kafkaBroker],
    });

    this.consumer = kafka.consumer({ groupId: env.consumerGroup });
    this.retryService = retryService;
  }

  public async start(): Promise<void> {
    await this.consumer.connect();
    console.log(LOG_MESSAGES.SUCCESS.KAFKA_CONSUMER_CONNECTED);

    await this.consumer.subscribe({ topic: env.kafkaRetryTopic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const raw = message.value.toString();

        try {
          const parsed = JSON.parse(raw) as RetryLog;
          await this.retryService.handleRetry(parsed);
        } catch (error) {
          console.error(LOG_MESSAGES.ERROR.HANDLE_RETRY_MESSAGE(raw), error);
        }
      },
    });
  }

  public async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      console.log(LOG_MESSAGES.SUCCESS.KAFKA_CONSUMER_DISCONNECTED);
    } catch (error) {
      console.error(LOG_MESSAGES.ERROR.CONSUMER_DISCONNECT, error);
    }
  }
}
