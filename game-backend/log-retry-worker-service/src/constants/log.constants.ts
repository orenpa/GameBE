import { RetryLog } from '../interfaces/retry.interface';

export const LOG_MESSAGES = {
  SUCCESS: {
    RETRY_SUCCEEDED: (playerId: string) => `Retry succeeded for player ${playerId}`,
    KAFKA_CONSUMER_CONNECTED: 'Kafka retry consumer connected',
    KAFKA_CONSUMER_DISCONNECTED: 'Kafka retry consumer disconnected',
  },
  ERROR: {
    RETRY_FAILED: (retryCount: number) => `Retry failed (count: ${retryCount})`,
    HANDLE_RETRY_MESSAGE: (raw: string) => `Failed to handle retry message: ${raw}`,
    CONSUMER_DISCONNECT: 'Failed to disconnect retry consumer:',
  },
  INFO: {
    REQUEUED: (retryCount: number) => `Requeued log for retry (count: ${retryCount})`,
    SENT_TO_DLQ: (playerId: string) => `Sent log to DLQ for player ${playerId}`,
  },
  CONSUMER: {
    CONNECTED: (topic: string) => `Log retry consumer connected to topic "${topic}"`,
    DISCONNECTED: 'Log retry consumer disconnected',
    SHUTDOWN_ERROR: 'Error during log retry consumer shutdown:',
    PROCESSED: (log: RetryLog) => `Log retry processed successfully: ${JSON.stringify(log)}`,
    PROCESS_ERROR: (raw: string, error: any) => `Failed to process log retry: ${raw}, ${error}`,
  },
  PROCESSING: {
    STARTED: 'Processing log retry:',
    COMPLETED: 'Log retry processed successfully:',
    FAILED: 'Failed to process log retry:',
    RETRYING: 'Retrying log processing:',
  },
  STORAGE: {
    SUCCESS: 'Log retry stored successfully:',
    ERROR: 'Failed to store log retry:',
  },
  SERVICE: {
    FLUSHED: (count: number) => `Flushed ${count} log retries to MongoDB`,
    FLUSH_ERROR: 'Failed to flush batch. Sending to DLQ.',
    DLQ_SENT: (count: number) => `Sent ${count} logs to DLQ`,
    DLQ_ERROR: 'Failed to send logs to DLQ:',
  },
};

export const LOG_CONFIG = {
  CONSUMER: {
    CLIENT_ID: 'log-retry-worker',
    GROUP_ID: 'log-retry-consumer-group',
  },
  SERVICE: {
    BATCH_SIZE: 10,
    FLUSH_INTERVAL: 2000, // ms
    MAX_RETRIES: 3,
  },
};

export const LOG_CONSTANTS = {
  CLIENT_IDS: {
    CONSUMER: 'log-retry-worker',
    PRODUCER: 'retry-service-producer',
  },
  RATE_LIMITER: {
    KEY: 'retry-mongodb-writes',
  },
}; 