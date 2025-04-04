import mongoose from 'mongoose';
import { LogPublisher } from '../utils/logPublisher';
import { LogType } from '../constants/log.enums';
import { SYSTEM_ACTOR } from '../constants/log.constants';
import redis from '../config/redis';
import { CACHE_KEYS, CACHE_CONFIG } from '../constants/cache.constants';
import { LEADERBOARD, LOG_MESSAGES, ERROR_MESSAGES } from '../constants/leaderboard.constants';

const Score = mongoose.connection.collection(LEADERBOARD.COLLECTION_NAME);

export interface LeaderboardEntry {
  playerId: string;
  totalScore: number;
}

export class LeaderboardService {
  private logPublisher: LogPublisher;

  constructor() {
    this.logPublisher = new LogPublisher();
  }

  async getTopPlayers(page: number = LEADERBOARD.DEFAULT_PAGE, limit: number = LEADERBOARD.DEFAULT_LIMIT): Promise<LeaderboardEntry[]> {
    const skip = (page - 1) * limit;

    try {
      // Try to get from cache first
      const cachedResult = await this.getFromCache(page, limit);
      if (cachedResult) {
        await this.logPublisher.publish({
          playerId: SYSTEM_ACTOR,
          logData: LOG_MESSAGES.CACHE_RETRIEVED(page, limit),
          logType: LogType.INFO,
        });
        return cachedResult;
      }

      // If not in cache, get from MongoDB
      const result = await this.getFromMongoDB(page, limit, skip);

      // Update cache
      await this.updateCache(page, limit, result);

      await this.logPublisher.publish({
        playerId: SYSTEM_ACTOR,
        logData: LOG_MESSAGES.MONGODB_RETRIEVED(page, limit),
        logType: LogType.INFO,
      });

      return result;
    } catch (error: any) {
      await this.logPublisher.publish({
        playerId: SYSTEM_ACTOR,
        logData: LOG_MESSAGES.FETCH_FAILED(error.message),
        logType: LogType.ERROR,
      });

      throw error;
    }
  }

  private async getFromCache(page: number, limit: number): Promise<LeaderboardEntry[] | null> {
    try {
      const cached = await redis.get(CACHE_KEYS.LEADERBOARD_PAGE(page, limit));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_READ, error);
      return null;
    }
  }

  private async updateCache(page: number, limit: number, data: LeaderboardEntry[]): Promise<void> {
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

  private async getFromMongoDB(page: number, limit: number, skip: number): Promise<LeaderboardEntry[]> {
    return await Score.aggregate<LeaderboardEntry>([
      {
        $group: {
          _id: '$playerId',
          totalScore: { $sum: '$score' },
        },
      },
      {
        $sort: { totalScore: -1, _id: 1 },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          playerId: '$_id',
          totalScore: 1,
        },
      },
    ]).toArray();
  }

  // Method to invalidate cache (called by Redis Pub/Sub)
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
