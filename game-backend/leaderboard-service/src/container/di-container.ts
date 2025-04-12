import { CacheService } from '../services/cache.service';
import { LeaderboardService } from '../services/leaderboard.service';
import { LogPublisher } from '../utils/logPublisher';
import { LeaderboardRepository } from '../repositories/leaderboard.repository';
import { ICacheService, ILogPublisher, ILeaderboardService, ILeaderboardRepository } from '../interfaces/service.interfaces';

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register('logPublisher', new LogPublisher());
    this.register('cacheService', new CacheService());
    this.register('leaderboardRepository', new LeaderboardRepository());
    
    this.register('leaderboardService', new LeaderboardService(
      this.get<ILogPublisher>('logPublisher'),
      this.get<ICacheService>('cacheService'),
      this.get<ILeaderboardRepository>('leaderboardRepository')
    ));
  }

  register(name: string, instance: any): void {
    this.services.set(name, instance);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in container`);
    }
    return service as T;
  }
}

// Export a singleton instance
export const container = new DIContainer(); 