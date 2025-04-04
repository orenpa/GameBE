export const DB_OPTIONS = {
  UPDATE: {
    RETURN_NEW: { new: true, runValidators: true },
  },
  MODELS: {
    SCORE: 'Score',
  },
  CONNECTION: {
    SERVER_SELECTION_TIMEOUT_MS: 5000,
  },
};

export const SCORE_SCHEMA = {
  FIELDS: {
    PLAYER_ID: 'playerId',
    SCORE: 'score',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },
  OPTIONS: {
    TIMESTAMPS: true,
  },
}; 