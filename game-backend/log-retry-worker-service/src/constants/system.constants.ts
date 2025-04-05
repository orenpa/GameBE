export const SYSTEM_MESSAGES = {
  STARTUP: {
    CONNECTING_MONGODB: 'Connecting to MongoDB...',
    CONNECTED_MONGODB: 'Connected to MongoDB',
    FAILED_STARTUP: 'Failed to start Log Retry Worker service:',
  },
  SHUTDOWN: {
    STARTED: 'Shutting down Log Retry Worker service...',
    COMPLETE: 'Log Retry Worker service shutdown complete',
  },
  ERROR: {
    ENV_MISSING: (key: string) => `${key} is missing`,
  },
}; 