export const LOG_MESSAGES = {
  CONSUMER: {
    CONNECTED: (topic: string) => `✅ Log consumer connected to topic "${topic}"`,
    DISCONNECTED: '❌ Log consumer disconnected',
    SHUTDOWN_ERROR: '❌ Error during log consumer shutdown:',
    PROCESSED: (log: any) => `✅ Log processed successfully: ${JSON.stringify(log)}`,
    PROCESS_ERROR: (raw: string, error: any) => `❌ Failed to process log: ${raw}, ${error}`,
  },
  PROCESSING: {
    STARTED: '🔄 Processing log:',
    COMPLETED: '✅ Log processed successfully:',
    FAILED: '❌ Failed to process log:',
    RETRYING: '🔄 Retrying log processing:',
  },
  STORAGE: {
    SUCCESS: '✅ Log stored successfully:',
    ERROR: '❌ Failed to store log:',
  },
  SERVICE: {
    FLUSHED: (count: number) => `✅ Flushed ${count} logs to MongoDB`,
    FLUSH_ERROR: '❌ Failed to flush batch. Sending to retry queue.',
    RETRY_SENT: (count: number) => `✅ Sent ${count} logs to retry queue`,
    RETRY_ERROR: '❌ Failed to send logs to retry topic:',
  },
};

export const LOG_CONFIG = {
  CONSUMER: {
    CLIENT_ID: 'log-worker',
    GROUP_ID: 'log-consumer-group',
  },
  SERVICE: {
    BATCH_SIZE: 10,
    FLUSH_INTERVAL: 2000, // ms
  },
};

export const LOG_TYPES = {
  INFO: 'info',
  ERROR: 'error',
  CRASH: 'crash',
  CRITICAL: 'critical',
} as const; 