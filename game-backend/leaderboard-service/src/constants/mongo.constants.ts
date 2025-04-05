export const MONGO_CONFIG = {
  SERVER_SELECTION_TIMEOUT: 5000,
  DEFAULT_URI: 'mongodb://localhost:27017/leaderboard',
} as const;

export const MONGO_QUERY = {
  SORT: {
    DESC: -1,
    ASC: 1,
  },
  PROJECTION: {
    EXCLUDE_ID: 0,
    INCLUDE: 1,
  },
} as const; 