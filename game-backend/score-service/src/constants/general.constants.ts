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
  CONNECTED_REDIS: 'Connected to Redis',
  SERVER_LISTENING: (port: number | string) => `Score Service listening on port ${port}`,
}; 