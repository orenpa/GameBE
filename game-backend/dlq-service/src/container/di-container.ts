import { DlqConsumer } from "../consumers/dlq.consumer";
import { DlqRepository } from "../repositories/dlq.repository";
import { IDlqConsumer, IDlqRepository } from "../interfaces/service.interfaces";

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register('dlqRepository', new DlqRepository());
    
    this.register('dlqConsumer', new DlqConsumer(
      this.get<IDlqRepository>('dlqRepository')
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