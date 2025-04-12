export const API_ENDPOINTS = {
  LOG_API: {
    LOGS: '/logs',
  },
  PLAYER_API: {
    BASE: '/players',
    BY_ID: (id: string) => `/players/${id}`,
  },
}; 