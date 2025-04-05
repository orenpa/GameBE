export const CONFIG = {
  DEFAULT: {
    MAX_CONCURRENT_WRITES: 3,
    MAX_WRITE_RATE_PER_SECOND: 20,
    KAFKA_RETRY_TOPIC: 'log-retries',
  },
  KAFKA: {
    FROM_BEGINNING: false,
  },
}; 