import { KafkaProducer } from '../producers/kafka.producer';
import { RedisBatchService } from '../services/redis-batch.service';
import { IKafkaProducer, IRedisBatchService } from '../interfaces/service.interfaces';

export interface IServiceFactory {
  createKafkaProducer(): IKafkaProducer;
  createRedisBatchService(): IRedisBatchService;
}

export class ServiceFactory implements IServiceFactory {
  createKafkaProducer(): IKafkaProducer {
    return new KafkaProducer();
  }

  createRedisBatchService(): IRedisBatchService {
    const kafkaProducer = this.createKafkaProducer();
    return new RedisBatchService(kafkaProducer);
  }
}

// Export a default instance
export const serviceFactory = new ServiceFactory(); 