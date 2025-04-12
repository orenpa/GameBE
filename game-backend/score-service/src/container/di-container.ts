import { CacheService } from '../services/cache.service';
import { ScoreService } from '../services/score.service';
import { LogPublisher } from '../utils/logPublisher';
import { ScoreRepository } from '../repositories/score.repository';
import { ICacheService, ILogPublisher, IScoreService } from '../interfaces/service.interfaces';
import { IScoreRepository } from '../repositories/score.repository';

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register('logPublisher', new LogPublisher());
    this.register('cacheService', new CacheService());
    this.register('scoreRepository', new ScoreRepository());
    
    this.register('scoreService', new ScoreService(
      this.get<ILogPublisher>('logPublisher'),
      this.get<ICacheService>('cacheService'),
      this.get<IScoreRepository>('scoreRepository')
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