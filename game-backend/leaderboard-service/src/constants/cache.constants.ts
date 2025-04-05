export const CACHE_KEYS = {
  LEADERBOARD_PAGE: (page: number, limit: number) => `leaderboard:page:${page}:limit:${limit}`,
  LEADERBOARD_TIMESTAMP: 'leaderboard:last_update',
} as const;

export const CACHE_CONFIG = {
  LEADERBOARD_TTL: 60, // 1 minute cache
  CACHE_PREFIX: 'leaderboard:',
  SCORE_UPDATE_CHANNEL: 'score:updates',
} as const;

export const CACHE_MESSAGES = {
  SCORE_UPDATE: 'Received score update:',
} as const; 