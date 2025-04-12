import { RedisTokenBucketRateLimiter } from "../utils/redisRateLimiter";
import { RetryService } from "../services/retry.service";
import { RetryConsumer } from "../consumers/retry.consumer";
import { KafkaProducer } from "../producers/kafka.producer";
import { IKafkaProducer, IRateLimiter, IRetryConsumer, IRetryService } from "../interfaces/service.interfaces";
import { env } from "../config/env";
import { LOG_CONSTANTS } from "../constants/log.constants";

export interface IServiceFactory {
  createRateLimiter(): IRateLimiter;
  createKafkaProducer(): IKafkaProducer;
  createRetryService(): IRetryService;
  createRetryConsumer(): IRetryConsumer;
}

export class ServiceFactory implements IServiceFactory {
  createRateLimiter(): IRateLimiter {
    return new RedisTokenBucketRateLimiter(
      LOG_CONSTANTS.RATE_LIMITER.KEY,
      env.maxWriteRatePerSecond,
      env.maxWriteRatePerSecond
    );
  }

  createKafkaProducer(): IKafkaProducer {
    return new KafkaProducer();
  }

  createRetryService(): IRetryService {
    const kafkaProducer = this.createKafkaProducer();
    const rateLimiter = this.createRateLimiter();
    return new RetryService(kafkaProducer, rateLimiter);
  }

  createRetryConsumer(): IRetryConsumer {
    const retryService = this.createRetryService();
    return new RetryConsumer(retryService);
  }
}

// Export a singleton instance
export const serviceFactory = new ServiceFactory(); 