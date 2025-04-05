export const SYSTEM_MESSAGES = {
  STARTUP: {
    CONNECTING_MONGODB: 'Connecting to MongoDB...',
    CONNECTED_MONGODB: 'Connected to MongoDB',
    LISTENING: (port: number) => `Leaderboard Service listening on port ${port}`,
    FAILED_STARTUP: 'Failed to start Leaderboard Service:',
  },
  ERROR: {
    ENV_MISSING: (key: string) => `${key} is not defined`,
  },
} as const; 