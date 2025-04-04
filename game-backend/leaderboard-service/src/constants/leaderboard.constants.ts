export const LEADERBOARD = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  COLLECTION_NAME: 'scores',
} as const;

export const LOG_MESSAGES = {
  CACHE_RETRIEVED: (page: number, limit: number) => `Leaderboard retrieved from cache (page ${page}, limit ${limit})`,
  MONGODB_RETRIEVED: (page: number, limit: number) => `Leaderboard retrieved from MongoDB (page ${page}, limit ${limit})`,
  FETCH_FAILED: (error: string) => `Failed to fetch leaderboard: ${error}`,
};

export const ERROR_MESSAGES = {
  CACHE_READ: 'Cache read error',
  CACHE_UPDATE: 'Cache update error',
  CACHE_INVALIDATION: 'Cache invalidation error',
} as const; 