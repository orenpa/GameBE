import { KafkaProducer } from '../producers/kafka.producer';
import { LogBatchService } from '../services/log-batch.service';
import { IKafkaProducer, ILogBatchService } from '../interfaces/service.interfaces';

export interface IServiceFactory {
  createKafkaProducer(): IKafkaProducer;
  createLogBatchService(): ILogBatchService;
}

export class ServiceFactory implements IServiceFactory {
  createKafkaProducer(): IKafkaProducer {
    return new KafkaProducer();
  }

  createLogBatchService(): ILogBatchService {
    const kafkaProducer = this.createKafkaProducer();
    return new LogBatchService(kafkaProducer);
  }
}

// Export a default instance
export const serviceFactory = new ServiceFactory(); 