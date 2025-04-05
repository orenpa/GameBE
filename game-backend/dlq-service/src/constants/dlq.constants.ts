export const DLQ_MESSAGES = {
  CONSUMER: {
    CONNECTED: 'DLQ Consumer connected',
    DISCONNECTED: 'DLQ consumer disconnected',
    SHUTDOWN_ERROR: 'Error during DLQ consumer shutdown:',
  },
  LOG: {
    STORED: (playerId: string, retryCount: number) => `DLQ log stored: ${playerId} (retryCount: ${retryCount})`,
    INSERT_ERROR: 'Failed to insert DLQ message:',
  },
};

export const DLQ_CONFIG = {
  CONSUMER_GROUP: 'dlq-consumer-group',
  CLIENT_ID: 'dlq-consumer',
}; 