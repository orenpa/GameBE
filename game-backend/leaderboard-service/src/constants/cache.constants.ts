export const CACHE_KEYS = {
  LEADERBOARD_PAGE: (page: number, limit: number) => `leaderboard:page:${page}:limit:${limit}`,
  LEADERBOARD_TIMESTAMP: 'leaderboard:last_update',
};

export const CACHE_CONFIG = {
  LEADERBOARD_TTL: 60, // 1 minute cache
  CACHE_PREFIX: 'leaderboard:',
}; 