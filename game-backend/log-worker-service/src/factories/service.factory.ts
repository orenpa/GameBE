import { RedisTokenBucketRateLimiter } from '../utils/redisRateLimiter';
import { LogService } from '../services/log.service';
import { LogConsumer } from '../consumers/log.consumer';
import { KafkaProducer } from '../producers/kafka.producer';
import { IKafkaProducer, ILogConsumer, ILogService, IRateLimiter } from '../interfaces/service.interfaces';
import { env } from '../config/env';
import { REDIS_KEYS } from '../constants/redis.constants';

export interface IServiceFactory {
  createRateLimiter(): IRateLimiter;
  createKafkaProducer(): IKafkaProducer;
  createLogService(): ILogService;
  createLogConsumer(): ILogConsumer;
}

export class ServiceFactory implements IServiceFactory {
  createRateLimiter(): IRateLimiter {
    return new RedisTokenBucketRateLimiter(
      REDIS_KEYS.MONGODB.WRITES,
      env.maxWriteRatePerSecond,
      env.maxWriteRatePerSecond
    );
  }

  createKafkaProducer(): IKafkaProducer {
    return new KafkaProducer();
  }

  createLogService(): ILogService {
    const kafkaProducer = this.createKafkaProducer();
    const rateLimiter = this.createRateLimiter();
    return new LogService(kafkaProducer, rateLimiter);
  }

  createLogConsumer(): ILogConsumer {
    const logService = this.createLogService();
    return new LogConsumer(logService);
  }
}

// Export a singleton instance
export const serviceFactory = new ServiceFactory(); 