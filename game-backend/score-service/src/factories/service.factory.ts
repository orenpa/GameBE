import { CacheService } from '../services/cache.service';
import { ScoreService } from '../services/score.service';
import { LogPublisher } from '../utils/logPublisher';
import { ICacheService, ILogPublisher, IScoreService } from '../interfaces/service.interfaces';
import { IScoreRepository, ScoreRepository } from '../repositories/score.repository';

export interface IServiceFactory {
  createLogPublisher(): ILogPublisher;
  createCacheService(): ICacheService;
  createScoreRepository(): IScoreRepository;
  createScoreService(): IScoreService;
}

export class ServiceFactory implements IServiceFactory {
  createLogPublisher(): ILogPublisher {
    return new LogPublisher();
  }

  createCacheService(): ICacheService {
    return new CacheService();
  }
  
  createScoreRepository(): IScoreRepository {
    return new ScoreRepository();
  }

  createScoreService(): IScoreService {
    const logPublisher = this.createLogPublisher();
    const cacheService = this.createCacheService();
    const scoreRepository = this.createScoreRepository();
    return new ScoreService(logPublisher, cacheService, scoreRepository);
  }
}

// Export a default instance
export const serviceFactory = new ServiceFactory(); 