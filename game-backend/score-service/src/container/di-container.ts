import { CacheService } from '../services/cache.service';
import { ScoreService } from '../services/score.service';
import { LogPublisher } from '../utils/logPublisher';
import { ScoreRepository } from '../repositories/score.repository';
import { ICacheService, ILogPublisher, IScoreService } from '../interfaces/service.interfaces';
import { IScoreRepository } from '../repositories/score.repository';
import { CONTAINER_SERVICES, CONTAINER_ERRORS } from '../constants/container.constants';

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register(CONTAINER_SERVICES.LOG_PUBLISHER, new LogPublisher());
    this.register(CONTAINER_SERVICES.CACHE_SERVICE, new CacheService());
    this.register(CONTAINER_SERVICES.SCORE_REPOSITORY, new ScoreRepository());
    
    this.register(CONTAINER_SERVICES.SCORE_SERVICE, new ScoreService(
      this.get<ILogPublisher>(CONTAINER_SERVICES.LOG_PUBLISHER),
      this.get<ICacheService>(CONTAINER_SERVICES.CACHE_SERVICE),
      this.get<IScoreRepository>(CONTAINER_SERVICES.SCORE_REPOSITORY)
    ));
  }

  register(name: string, instance: any): void {
    this.services.set(name, instance);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(CONTAINER_ERRORS.SERVICE_NOT_FOUND(name));
    }
    return service as T;
  }
}

// Export a singleton instance
export const container = new DIContainer(); 