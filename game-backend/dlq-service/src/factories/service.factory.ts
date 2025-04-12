import { DlqConsumer } from "../consumers/dlq.consumer";
import { DlqRepository } from "../repositories/dlq.repository";
import { IDlqConsumer, IDlqRepository } from "../interfaces/service.interfaces";

export interface IServiceFactory {
  createDlqRepository(): IDlqRepository;
  createDlqConsumer(): IDlqConsumer;
}

export class ServiceFactory implements IServiceFactory {
  createDlqRepository(): IDlqRepository {
    return new DlqRepository();
  }

  createDlqConsumer(): IDlqConsumer {
    const dlqRepository = this.createDlqRepository();
    return new DlqConsumer(dlqRepository);
  }
}

// Export a singleton instance
export const serviceFactory = new ServiceFactory(); 