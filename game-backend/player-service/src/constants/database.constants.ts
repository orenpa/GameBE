export const DB_OPTIONS = {
  UPDATE: {
    RETURN_NEW: { new: true, runValidators: true },
  },
  MODELS: {
    PLAYER: 'Player',
  },
};

export const PLAYER_SCHEMA = {
  FIELDS: {
    USERNAME: 'username',
    EMAIL: 'email',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },
  OPTIONS: {
    TIMESTAMPS: true,
  },
}; 