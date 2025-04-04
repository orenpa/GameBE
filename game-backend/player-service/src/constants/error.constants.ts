export const ERROR_MESSAGES = {
  REDIS: {
    GET_ERROR: 'Redis get error:',
    SET_ERROR: 'Redis set error:',
    DELETE_ERROR: 'Redis delete error:',
    INVALIDATE_ALL_ERROR: 'Redis invalidate all error:',
    CONNECTION_ERROR: 'Redis Client Error:',
    FAILED_CONNECTION: 'Failed to connect to Redis:',
  },
  SERVER: {
    FAILED_START: 'Failed to start server:',
  },
  ENV: {
    MISSING_MONGO_URI: 'MONGO_URI is missing',
    MISSING_KAFKA_BROKER: 'KAFKA_BROKER is missing',
    MISSING_KAFKA_RETRY_TOPIC: 'KAFKA_RETRY_TOPIC is missing',
    MISSING_LOG_API_URL: 'LOG_API_URL is not defined',
    MISSING_REDIS_URL: 'REDIS_URL is not defined',
  },
}; 