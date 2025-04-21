import { KafkaProducer } from '../producers/kafka.producer';
import { LogBatchService } from '../services/log-batch.service';
import { IKafkaProducer, ILogBatchService } from '../interfaces/service.interfaces';
import { CONTAINER_SERVICES, CONTAINER_ERRORS } from '../constants/container.constants';

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register(CONTAINER_SERVICES.KAFKA_PRODUCER, new KafkaProducer());
    
    this.register(CONTAINER_SERVICES.LOG_BATCH_SERVICE, new LogBatchService(
      this.get<IKafkaProducer>(CONTAINER_SERVICES.KAFKA_PRODUCER)
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