import { KafkaProducer } from '../producers/kafka.producer';
import { RedisBatchService } from '../services/redis-batch.service';
import { IKafkaProducer, IRedisBatchService } from '../interfaces/service.interfaces';

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register('kafkaProducer', new KafkaProducer());
    
    this.register('redisBatchService', new RedisBatchService(
      this.get<IKafkaProducer>('kafkaProducer')
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