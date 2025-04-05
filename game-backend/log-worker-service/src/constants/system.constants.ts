export const SYSTEM_MESSAGES = {
  STARTUP: {
    CONNECTING_MONGODB: 'Connecting to MongoDB...',
    CONNECTED_MONGODB: 'Connected to MongoDB',
    FAILED_STARTUP: 'Failed to start Log Worker service:',
  },
  SHUTDOWN: {
    STARTED: 'Shutting down Log Worker service...',
    COMPLETE: 'Log Worker service shutdown complete',
  },
  ERROR: {
    ENV_MISSING: (key: string) => `${key} is missing`,
  },
}; 