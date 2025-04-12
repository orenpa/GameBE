import { LogType } from '../constants/log.enums';
import { SYSTEM_ACTOR } from '../constants/log.constants';
import { LEADERBOARD, LOG_MESSAGES } from '../constants/leaderboard.constants';
import { ILogPublisher, ICacheService, ILeaderboardRepository, ILeaderboardService } from '../interfaces/service.interfaces';
import { LogPublisher } from '../utils/logPublisher';
import { CacheService } from './cache.service';
import { LeaderboardRepository } from '../repositories/leaderboard.repository';

export interface LeaderboardEntry {
  playerId: string;
  totalScore: number;
}

export class LeaderboardService implements ILeaderboardService {
  private logPublisher: ILogPublisher;
  private cacheService: ICacheService;
  private leaderboardRepository: ILeaderboardRepository;

  constructor(
    logPublisher: ILogPublisher = new LogPublisher(),
    cacheService: ICacheService = new CacheService(),
    leaderboardRepository: ILeaderboardRepository = new LeaderboardRepository()
  ) {
    this.logPublisher = logPublisher;
    this.cacheService = cacheService;
    this.leaderboardRepository = leaderboardRepository;
  }

  async getTopPlayers(page: number = LEADERBOARD.DEFAULT_PAGE, limit: number = LEADERBOARD.DEFAULT_LIMIT): Promise<LeaderboardEntry[]> {
    const skip = (page - 1) * limit;

    try {
      // Try to get from cache first
      const cachedResult = await this.cacheService.getFromCache(page, limit);
      if (cachedResult) {
        await this.logPublisher.publish({
          playerId: SYSTEM_ACTOR,
          logData: LOG_MESSAGES.CACHE_RETRIEVED(page, limit),
          logType: LogType.INFO,
        });
        return cachedResult;
      }

      // If not in cache, get from MongoDB
      const result = await this.leaderboardRepository.getTopPlayers(page, limit, skip);

      // Update cache
      await this.cacheService.updateCache(page, limit, result);

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

  // Method to invalidate cache (called by Redis Pub/Sub)
  async invalidateCache(): Promise<void> {
    await this.cacheService.invalidateCache();
  }
}
