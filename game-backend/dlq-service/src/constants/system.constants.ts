export const SYSTEM_MESSAGES = {
  STARTUP: {
    CONNECTING_MONGODB: 'Connecting to MongoDB...',
    CONNECTED_MONGODB: 'Connected to MongoDB',
    FAILED_STARTUP: 'Failed to start DLQ service:',
  },
  SHUTDOWN: {
    STARTED: 'Shutting down DLQ service...',
    COMPLETE: 'DLQ service shutdown complete',
  },
  ERROR: {
    ENV_MISSING: (key: string) => `${key} is missing`,
  },
}; 