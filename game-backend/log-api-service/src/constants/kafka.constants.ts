export const KAFKA_CONFIG = {
  CLIENT_ID: 'log-api-producer',
  DEFAULT_PORT: 3004,
};

export const KAFKA_MESSAGES = {
  SEND_SUCCESS: 'Log sent to Kafka successfully',
  SEND_FAILED: 'Failed to send log to Kafka',
  DISCONNECT_SUCCESS: 'Kafka producer disconnected successfully',
  DISCONNECT_FAILED: 'Failed to disconnect Kafka producer',
  BATCH_SEND_SUCCESS: (count: number) => `Batch of ${count} logs sent to Kafka successfully`,
  BATCH_SEND_FAILED: 'Failed to send log batch to Kafka',
};

export const KAFKA_TOPICS = {
  HIGH_PRIORITY: 'high-priority-logs',
  LOW_PRIORITY: 'low-priority-logs',
}; 