export const GENERAL = {
  UNKNOWN_PLAYER_ID: 'unknown',
  VALIDATION_ERROR: 'ValidationError',
  MONGO_DB_ERROR: {
    DUPLICATE_KEY: 11000,
  },
};

export const SERVER_MESSAGES = {
  CONNECTING_MONGO: 'Connecting to MongoDB...',
  CONNECTED_MONGO: 'Connected to MongoDB',
  CONNECTING_REDIS: 'Connecting to Redis...',
  CONNECTED_REDIS: 'Connected to Redis',
  CONNECTING_KAFKA: 'Connecting to Kafka...',
  CONNECTED_KAFKA: 'Connected to Kafka',
  SERVER_LISTENING: (port: number | string) => `Log API Service listening on port ${port}`,
  SHUTTING_DOWN: 'Shutting down gracefully...',
  SHUTDOWN_COMPLETE: 'Cleanup complete. Goodbye 👋',
}; 