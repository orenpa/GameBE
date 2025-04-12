import { RedisTokenBucketRateLimiter } from "../utils/redisRateLimiter";
import { RetryService } from "../services/retry.service";
import { RetryConsumer } from "../consumers/retry.consumer";
import { KafkaProducer } from "../producers/kafka.producer";
import { IKafkaProducer, IRateLimiter, IRetryConsumer, IRetryService } from "../interfaces/service.interfaces";
import { env } from "../config/env";
import { LOG_CONSTANTS } from "../constants/log.constants";
import { CONTAINER_SERVICES, CONTAINER_ERRORS } from "../constants/container.constants";

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register(CONTAINER_SERVICES.RATE_LIMITER, new RedisTokenBucketRateLimiter(
      LOG_CONSTANTS.RATE_LIMITER.KEY, 
      env.maxWriteRatePerSecond, 
      env.maxWriteRatePerSecond
    ));
    
    this.register(CONTAINER_SERVICES.KAFKA_PRODUCER, new KafkaProducer());
    
    this.register(CONTAINER_SERVICES.RETRY_SERVICE, new RetryService(
      this.get<IKafkaProducer>(CONTAINER_SERVICES.KAFKA_PRODUCER),
      this.get<IRateLimiter>(CONTAINER_SERVICES.RATE_LIMITER)
    ));
    
    this.register(CONTAINER_SERVICES.RETRY_CONSUMER, new RetryConsumer(
      this.get<IRetryService>(CONTAINER_SERVICES.RETRY_SERVICE)
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