import Score, { IScore } from '../models/score.model';
import redis from '../config/redis';
import { LogPublisher } from '../utils/logPublisher';
import { SYSTEM_ACTOR, LOG_MESSAGES } from '../constants/log.constants';
import { LogType } from '../constants/log.enums';
import { GENERAL } from '../constants/general.constants';
import { REDIS_KEYS, REDIS_CHANNELS, REDIS_OPTIONS } from '../constants/redis.constants';
import { ERROR_MESSAGES } from '../constants/error.constants';

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
        logData: LOG_MESSAGES.SCORE.SUBMITTED(score),
        logType: LogType.INFO,
      });

      return saved;
    } catch (error: any) {
      await this.logPublisher.publish({
        playerId: data.playerId || GENERAL.UNKNOWN_PLAYER_ID,
        logData: LOG_MESSAGES.SCORE.FAILED_CREATE(error.message),
        logType: LogType.ERROR,
      });
      throw error;
    }
  }

  async getTopScores(limit = 10): Promise<{ playerId: string; score: number }[]> {
    try {
      const top = await redis.zRangeWithScores(
        REDIS_KEYS.GLOBAL_LEADERBOARD, 
        '0', 
        String(limit - 1), 
        { REV: true }
      );

      await this.logPublisher.publish({
        playerId: SYSTEM_ACTOR,
        logData: LOG_MESSAGES.SCORE.TOP_RETRIEVED(limit),
        logType: LogType.INFO,
      });

      return top.map(({ value, score }) => ({
        playerId: value,
        score,
      }));
    } catch (error: any) {
      await this.logPublisher.publish({
        playerId: SYSTEM_ACTOR,
        logData: LOG_MESSAGES.SCORE.FAILED_FETCH(error.message),
        logType: LogType.ERROR,
      });
      throw error;
    }
  }

  private async publishScoreUpdate(playerId: string, score: number): Promise<void> {
    try {
      await redis.publish(REDIS_CHANNELS.SCORE_UPDATES, JSON.stringify({ playerId, score }));
    } catch (error) {
      console.error(ERROR_MESSAGES.REDIS.PUBLISH_ERROR, error);
    }
  }
}
