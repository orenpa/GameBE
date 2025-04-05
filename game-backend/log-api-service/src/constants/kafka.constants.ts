export const KAFKA_CONFIG = {
  CLIENT_ID: 'log-api-producer',
  DEFAULT_PORT: 3004,
};

export const KAFKA_MESSAGES = {
  SEND_SUCCESS: 'Log sent to Kafka successfully',
  SEND_FAILED: 'Failed to send log to Kafka',
};

export const KAFKA_TOPICS = {
  HIGH_PRIORITY: 'high-priority-logs',
  LOW_PRIORITY: 'low-priority-logs',
}; 