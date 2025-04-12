import { DlqConsumer } from "../consumers/dlq.consumer";
import { DlqRepository } from "../repositories/dlq.repository";
import { IDlqConsumer, IDlqRepository } from "../interfaces/service.interfaces";
import { CONTAINER_SERVICES, CONTAINER_ERRORS } from "../constants/container.constants";

class DIContainer {
  private services: Map<string, any> = new Map();

  constructor() {
    // Register default implementations
    this.register(CONTAINER_SERVICES.DLQ_REPOSITORY, new DlqRepository());
    
    this.register(CONTAINER_SERVICES.DLQ_CONSUMER, new DlqConsumer(
      this.get<IDlqRepository>(CONTAINER_SERVICES.DLQ_REPOSITORY)
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