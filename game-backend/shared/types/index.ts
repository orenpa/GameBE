export interface Player {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameScore {
  id: string;
  playerId: string;
  score: number;
  gameType: string;
  createdAt: Date;
}

export interface LeaderboardEntry {
  playerId: string;
  username: string;
  totalScore: number;
  rank: number;
}

export interface ClientLog {
  id: string;
  playerId: string;
  logData: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  metadata?: Record<string, any>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceError extends Error {
  statusCode: number;
  code: string;
} 