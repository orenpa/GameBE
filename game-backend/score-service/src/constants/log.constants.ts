export const SYSTEM_ACTOR = 'system';

export const LOG_MESSAGES = {
  SCORE: {
    SUBMITTED: (score: number) => `Score submitted: ${score}`,
    FAILED_CREATE: (error: string) => `Failed to create score: ${error}`,
    TOP_RETRIEVED: (limit: number) => `Top ${limit} scores retrieved`,
    FAILED_FETCH: (error: string) => `Failed to fetch top scores: ${error}`,
  },
};
