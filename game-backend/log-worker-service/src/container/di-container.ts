import { RedisTokenBucketRateLimiter } from "../utils/redisRateLimiter";
import { LogService } from "../services/log.service";
import { LogConsumer } from "../consumers/log.consumer";
import { KafkaProducer } from "../producers/kafka.producer";
import { IKafkaProducer, ILogConsumer, ILogService, IRateLimiter } from "../interfaces/service.interfaces";
import { env } from "../config/env";
import { REDIS_KEYS } from "../constants/redis.constants";
import { CONTAINER_SERVICES, CONTAINER_ERRORS } from "../constants/container.constants";

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register(CONTAINER_SERVICES.RATE_LIMITER, new RedisTokenBucketRateLimiter(
      REDIS_KEYS.MONGODB.WRITES,
      env.maxWriteRatePerSecond,
      env.maxWriteRatePerSecond
    ));
    
    this.register(CONTAINER_SERVICES.KAFKA_PRODUCER, new KafkaProducer());
    
    this.register(CONTAINER_SERVICES.LOG_SERVICE, new LogService(
      this.get<IKafkaProducer>(CONTAINER_SERVICES.KAFKA_PRODUCER),
      this.get<IRateLimiter>(CONTAINER_SERVICES.RATE_LIMITER)
    ));
    
    this.register(CONTAINER_SERVICES.LOG_CONSUMER, new LogConsumer(
      this.get<ILogService>(CONTAINER_SERVICES.LOG_SERVICE)
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