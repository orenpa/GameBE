import Score, { IScore } from '../models/score.model';
import redis from '../config/redis';
import { LogPublisher } from '../utils/logPublisher';
import {  SYSTEM_ACTOR, REDIS_KEYS } from '../constants/log.constants';
import { LogType } from '../constants/log.enums';

export class ScoreService {
  private logPublisher: LogPublisher;

  constructor() {
    this.logPublisher = new LogPublisher();
  }

  async createScore(data: Partial<IScore>): Promise<IScore> {
    try {
      const scoreDoc = new Score(data);
      const saved = await scoreDoc.save();

      const { playerId, score } = saved;

      if (playerId && typeof score === 'number') {
        await redis.zAdd(REDIS_KEYS.GLOBAL_LEADERBOARD, {
          score,
          value: playerId,
        });

        // Publish score update event
        await this.publishScoreUpdate(playerId, score);
      }

      await this.logPublisher.publish({
        playerId: String(playerId),
        logData: `✅ Score submitted: ${score}`,
        logType: LogType.INFO,
      });

      return saved;
    } catch (error: any) {
      await this.logPublisher.publish({
        playerId: data.playerId || 'unknown',
        logData: `❌ Failed to create score: ${error.message}`,
        logType: LogType.ERROR,
      });
      throw error;
    }
  }

  async getTopScores(limit = 10): Promise<{ playerId: string; score: number }[]> {
    try {
      const top = await redis.zRangeWithScores(REDIS_KEYS.GLOBAL_LEADERBOARD, 0, limit - 1, {
        REV: true,
      });

      await this.logPublisher.publish({
        playerId: SYSTEM_ACTOR,
        logData: `📈 Top ${limit} scores retrieved`,
        logType: LogType.INFO,
      });

      return top.map(({ value, score }) => ({
        playerId: value,
        score,
      }));
    } catch (error: any) {
      await this.logPublisher.publish({
        playerId: SYSTEM_ACTOR,
        logData: `❌ Failed to fetch top scores: ${error.message}`,
        logType: LogType.ERROR,
      });
      throw error;
    }
  }

  private async publishScoreUpdate(playerId: string, score: number): Promise<void> {
    try {
      await redis.publish('score:updates', JSON.stringify({ playerId, score }));
    } catch (error) {
      console.error('Failed to publish score update:', error);
    }
  }
}
