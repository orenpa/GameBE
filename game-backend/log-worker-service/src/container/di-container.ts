import { RedisTokenBucketRateLimiter } from "../utils/redisRateLimiter";
import { LogService } from "../services/log.service";
import { LogConsumer } from "../consumers/log.consumer";
import { KafkaProducer } from "../producers/kafka.producer";
import { IKafkaProducer, ILogConsumer, ILogService, IRateLimiter } from "../interfaces/service.interfaces";
import { env } from "../config/env";
import { REDIS_KEYS } from "../constants/redis.constants";

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register('rateLimiter', new RedisTokenBucketRateLimiter(
      REDIS_KEYS.MONGODB.WRITES,
      env.maxWriteRatePerSecond,
      env.maxWriteRatePerSecond
    ));
    
    this.register('kafkaProducer', new KafkaProducer());
    
    this.register('logService', new LogService(
      this.get<IKafkaProducer>('kafkaProducer'),
      this.get<IRateLimiter>('rateLimiter')
    ));
    
    this.register('logConsumer', new LogConsumer(
      this.get<ILogService>('logService')
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