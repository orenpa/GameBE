import { CacheService } from '../services/cache.service';
import { LeaderboardService } from '../services/leaderboard.service';
import { LogPublisher } from '../utils/logPublisher';
import { ILogPublisher, ICacheService, ILeaderboardService, ILeaderboardRepository } from '../interfaces/service.interfaces';
import { LeaderboardRepository } from '../repositories/leaderboard.repository';

export interface IServiceFactory {
  createLogPublisher(): ILogPublisher;
  createCacheService(): ICacheService;
  createLeaderboardRepository(): ILeaderboardRepository;
  createLeaderboardService(): ILeaderboardService;
}

export class ServiceFactory implements IServiceFactory {
  createLogPublisher(): ILogPublisher {
    return new LogPublisher();
  }

  createCacheService(): ICacheService {
    return new CacheService();
  }
  
  createLeaderboardRepository(): ILeaderboardRepository {
    return new LeaderboardRepository();
  }

  createLeaderboardService(): ILeaderboardService {
    const logPublisher = this.createLogPublisher();
    const cacheService = this.createCacheService();
    const leaderboardRepository = this.createLeaderboardRepository();
    return new LeaderboardService(logPublisher, cacheService, leaderboardRepository);
  }
}

// Export a default instance
export const serviceFactory = new ServiceFactory(); 