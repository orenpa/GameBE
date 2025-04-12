import { CacheService } from '../services/cache.service';
import { PlayerService } from '../services/player.service';
import { LogPublisher } from '../utils/logPublisher';
import { ICacheService, ILogPublisher, IPlayerService } from '../interfaces/service.interfaces';
import { CONTAINER_SERVICES, CONTAINER_ERRORS } from '../constants/container.constants';

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register(CONTAINER_SERVICES.LOG_PUBLISHER, new LogPublisher());
    this.register(CONTAINER_SERVICES.CACHE_SERVICE, new CacheService());
    this.register(CONTAINER_SERVICES.PLAYER_SERVICE, new PlayerService(
      this.get<ILogPublisher>(CONTAINER_SERVICES.LOG_PUBLISHER),
      this.get<ICacheService>(CONTAINER_SERVICES.CACHE_SERVICE)
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