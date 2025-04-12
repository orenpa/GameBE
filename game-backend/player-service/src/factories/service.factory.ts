import { CacheService } from '../services/cache.service';
import { PlayerService } from '../services/player.service';
import { LogPublisher } from '../utils/logPublisher';
import { ICacheService, ILogPublisher, IPlayerService } from '../interfaces/service.interfaces';
import { IPlayerRepository, PlayerRepository } from '../repositories/player.repository';

export interface IServiceFactory {
  createLogPublisher(): ILogPublisher;
  createCacheService(): ICacheService;
  createPlayerRepository(): IPlayerRepository;
  createPlayerService(): IPlayerService;
}

export class ServiceFactory implements IServiceFactory {
  createLogPublisher(): ILogPublisher {
    return new LogPublisher();
  }

  createCacheService(): ICacheService {
    return new CacheService();
  }
  
  createPlayerRepository(): IPlayerRepository {
    return new PlayerRepository();
  }

  createPlayerService(): IPlayerService {
    const logPublisher = this.createLogPublisher();
    const cacheService = this.createCacheService();
    const playerRepository = this.createPlayerRepository();
    return new PlayerService(logPublisher, cacheService, playerRepository);
  }
}

// Export a default instance
export const serviceFactory = new ServiceFactory(); 