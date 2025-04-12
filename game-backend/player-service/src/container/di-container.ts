import { CacheService } from '../services/cache.service';
import { PlayerService } from '../services/player.service';
import { LogPublisher } from '../utils/logPublisher';
import { ICacheService, ILogPublisher, IPlayerService } from '../interfaces/service.interfaces';

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register('logPublisher', new LogPublisher());
    this.register('cacheService', new CacheService());
    this.register('playerService', new PlayerService(
      this.get<ILogPublisher>('logPublisher'),
      this.get<ICacheService>('cacheService')
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