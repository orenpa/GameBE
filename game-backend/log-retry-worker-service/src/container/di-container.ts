import { RedisTokenBucketRateLimiter } from "../utils/redisRateLimiter";
import { RetryService } from "../services/retry.service";
import { RetryConsumer } from "../consumers/retry.consumer";
import { KafkaProducer } from "../producers/kafka.producer";
import { IKafkaProducer, IRateLimiter, IRetryConsumer, IRetryService } from "../interfaces/service.interfaces";
import { env } from "../config/env";
import { LOG_CONSTANTS } from "../constants/log.constants";

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register('rateLimiter', new RedisTokenBucketRateLimiter(
      LOG_CONSTANTS.RATE_LIMITER.KEY, 
      env.maxWriteRatePerSecond, 
      env.maxWriteRatePerSecond
    ));
    
    this.register('kafkaProducer', new KafkaProducer());
    
    this.register('retryService', new RetryService(
      this.get<IKafkaProducer>('kafkaProducer'),
      this.get<IRateLimiter>('rateLimiter')
    ));
    
    this.register('retryConsumer', new RetryConsumer(
      this.get<IRetryService>('retryService')
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