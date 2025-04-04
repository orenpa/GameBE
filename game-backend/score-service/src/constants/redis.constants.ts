export const REDIS_KEYS = {
  GLOBAL_LEADERBOARD: 'scores:global',
};

export const REDIS_CHANNELS = {
  SCORE_UPDATES: 'score:updates',
};

export const REDIS_OPTIONS = {
  ZRANGE: {
    REV: true,
  },
}; 