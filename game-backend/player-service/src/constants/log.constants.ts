export enum LOG_TYPE {
  INFO = 'info',
  ERROR = 'error',
}

export const LOG_MESSAGES = {
  PLAYER: {
    CREATED: (email: string) => `Player created: ${email}`,
    NOT_FOUND: 'Player not found',
    RETRIEVED_CACHE: 'Retrieved player profile from cache',
    RETRIEVED_DB: 'Retrieved player profile from database',
    UPDATED: 'Updated player profile',
    FAILED_UPDATE: 'Failed to update: Player not found',
    DELETED: '🗑️ Deleted player profile',
    FAILED_DELETE: 'Failed to delete: Player not found',
    FAILED_CREATE: (error: string) => `Failed to create player: ${error}`,
  },
}; 