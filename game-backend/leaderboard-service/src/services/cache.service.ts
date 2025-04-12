import redis from '../config/redis';
import { ICacheService } from '../interfaces/service.interfaces';
import { LeaderboardEntry } from './leaderboard.service';
import { CACHE_KEYS, CACHE_CONFIG } from '../constants/cache.constants';
import { ERROR_MESSAGES } from '../constants/leaderboard.constants';

export class CacheService implements ICacheService {
  async getFromCache(page: number, limit: number): Promise<LeaderboardEntry[] | null> {
    try {
      const cached = await redis.get(CACHE_KEYS.LEADERBOARD_PAGE(page, limit));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_READ, error);
      return null;
    }
  }

  async updateCache(page: number, limit: number, data: LeaderboardEntry[]): Promise<void> {
    try {
      await redis.set(
        CACHE_KEYS.LEADERBOARD_PAGE(page, limit),
        JSON.stringify(data),
        { EX: CACHE_CONFIG.LEADERBOARD_TTL }
      );
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_UPDATE, error);
    }
  }

  async invalidateCache(): Promise<void> {
    try {
      const keys = await redis.keys(`${CACHE_CONFIG.CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_INVALIDATION, error);
    }
  }
} 