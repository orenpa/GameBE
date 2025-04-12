import { IScore } from '../models/score.model';

export interface ILogPublisher {
  publish(logData: {
    playerId: string;
    logData: string;
    logType?: string;
  }): Promise<void>;
}

export interface ICacheService {
  addToLeaderboard(playerId: string, score: number): Promise<void>;
  getTopScores(limit: number): Promise<{ playerId: string; score: number }[]>;
  publishScoreUpdate(playerId: string, score: number): Promise<void>;
}

export interface IScoreService {
  createScore(data: Partial<IScore>): Promise<IScore>;
  getTopScores(limit?: number): Promise<{ playerId: string; score: number }[]>;
} 