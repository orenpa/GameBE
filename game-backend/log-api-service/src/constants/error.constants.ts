export const ERROR_MESSAGES = {
  SERVER: {
    FAILED_START: 'Failed to start server',
    FAILED_CONNECT_MONGO: 'Failed to connect to MongoDB',
    FAILED_CONNECT_REDIS: 'Failed to connect to Redis',
    FAILED_CONNECT_KAFKA: 'Failed to connect to Kafka',
  },
  VALIDATION: {
    INVALID_LOG_DATA: 'Invalid log data provided',
    MISSING_REQUIRED_FIELDS: 'Missing required fields in log data',
  },
  PROCESSING: {
    BATCH_FAILED: 'Failed to process log batch',
    INVALID_PRIORITY: 'Invalid priority level provided',
    INVALID_LOG_TYPE: 'Invalid log type provided',
  },
}; 