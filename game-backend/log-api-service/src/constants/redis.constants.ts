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