export const CONFIG = {
  DEFAULT: {
    MAX_CONCURRENT_WRITES: 100,
    MAX_WRITE_RATE_PER_SECOND: 1000,
    KAFKA_RETRY_TOPIC: 'log-retry',
    KAFKA_DLQ_TOPIC: 'log-dlq',
    MAX_RETRIES: 3,
  },
  KAFKA: {
    FROM_BEGINNING: false,
  },
}; 