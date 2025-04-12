import { LeaderboardEntry } from '../services/leaderboard.service';

export interface ILogPublisher {
  publish(logData: {
    playerId: string;
    logData: string;
    logType?: string;
  }): Promise<void>;
}

export interface ICacheService {
  getFromCache(page: number, limit: number): Promise<LeaderboardEntry[] | null>;
  updateCache(page: number, limit: number, data: LeaderboardEntry[]): Promise<void>;
  invalidateCache(): Promise<void>;
}

export interface ILeaderboardRepository {
  getTopPlayers(page: number, limit: number, skip: number): Promise<LeaderboardEntry[]>;
}

export interface ILeaderboardService {
  getTopPlayers(page?: number, limit?: number): Promise<LeaderboardEntry[]>;
  invalidateCache(): Promise<void>;
} 