export const GENERAL = {
  UNKNOWN_PLAYER_ID: 'unknown',
  VALIDATION_ERROR: 'ValidationError',
  MONGO_DB_ERROR: {
    DUPLICATE_KEY: 11000,
  },
  DEFAULT_ERROR_MESSAGE: 'Something went wrong',
  HEALTH_MESSAGE: 'Player Service is healthy 💪',
};

export const SERVER_MESSAGES = {
  CONNECTING_MONGO: 'Connecting to MongoDB...',
  CONNECTED_MONGO: 'Connected to MongoDB',
  CONNECTING_REDIS: 'Connecting to Redis...',
  CONNECTED_REDIS: 'Connected to Redis',
  SERVER_LISTENING: (port: number | string) => `Player Service listening on port ${port}`,
}; 