export const REDIS_KEYS = {
  LOGS_QUEUE: 'logs:priority',
  BATCH_FLUSH_LOCK: 'log-batch-flush',
  SHUTDOWN_LOCK: 'log-batch-flush-shutdown',
};

export const BATCH_SCORES = {
  CRASH: -1000,    // Highest priority (most negative)
  ERROR: -500,     // Medium priority
  DEFAULT: -100,   // Default priority
  CRITICAL_BOOST: -900, // Boost for critical logs
};

export const BATCH_RANGES = {
  HIGH_PRIORITY: {
    MIN: -10000,
    MAX: -500,
  },
  LOW_PRIORITY: {
    MIN: -499,
    MAX: 0,
  },
};

export const BATCH_TIMES = {
  LOCK_TIMEOUT: 30, // seconds
  SHUTDOWN_LOCK_TIMEOUT: 60, // seconds
  LOW_PRIORITY_MULTIPLIER: 3, // times the flush interval
};

export const REDIS_MESSAGES = {
  CONNECTION: {
    ERROR: 'Redis connection error:',
    CONNECTED: 'Connected to Redis',
    RECONNECTING: 'Reconnecting to Redis...',
  },
  BATCH: {
    LOCK_ACQUIRED: (workerId: string) => `Lock acquired by worker ${workerId}`,
    LOCK_RELEASED: (workerId: string) => `Lock released by worker ${workerId}`,
    ANOTHER_WORKER: 'Another worker is processing the batch queue',
    PROCESSING_ERROR: 'Error processing batch:',
    PARSE_ERROR: 'Error parsing log JSON:',
    SENT_LOGS: (workerId: string, count: number, topic: string) => 
      `Worker ${workerId} sent ${count} logs to Kafka topic ${topic}`,
  },
  SHUTDOWN: {
    STARTED: (workerId: string) => `Shutting down Redis batch service for worker ${workerId}...`,
    COMPLETE: (workerId: string) => `Redis batch service shutdown complete for worker ${workerId}`,
  },
}; 