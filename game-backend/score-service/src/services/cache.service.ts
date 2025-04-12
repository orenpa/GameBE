import redis from '../config/redis';
import { REDIS_KEYS, REDIS_CHANNELS } from '../constants/redis.constants';
import { ERROR_MESSAGES } from '../constants/error.constants';
import { ICacheService } from '../interfaces/service.interfaces';

export class CacheService implements ICacheService {
  async addToLeaderboard(playerId: string, score: number): Promise<void> {
    try {
      await redis.zAdd(REDIS_KEYS.GLOBAL_LEADERBOARD, {
        score,
        value: playerId,
      });
    } catch (error) {
      console.error('Failed to add score to leaderboard:', error);
      throw error;
    }
  }

  async getTopScores(limit: number): Promise<{ playerId: string; score: number }[]> {
    try {
      const top = await redis.zRangeWithScores(
        REDIS_KEYS.GLOBAL_LEADERBOARD, 
        '0', 
        String(limit - 1), 
        { REV: true }
      );

      return top.map(({ value, score }) => ({
        playerId: value,
        score,
      }));
    } catch (error) {
      console.error('Failed to get top scores from Redis:', error);
      throw error;
    }
  }

  async publishScoreUpdate(playerId: string, score: number): Promise<void> {
    try {
      await redis.publish(REDIS_CHANNELS.SCORE_UPDATES, JSON.stringify({ playerId, score }));
    } catch (error) {
      console.error(ERROR_MESSAGES.REDIS.PUBLISH_ERROR, error);
    }
  }
} 