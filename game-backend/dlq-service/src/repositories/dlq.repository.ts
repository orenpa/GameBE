import { DlqLogModel } from '../models/dlq-log.model';
import { DLQ_MESSAGES } from '../constants/dlq.constants';
import { DlqLogEntry, IDlqRepository } from '../interfaces/service.interfaces';

export class DlqRepository implements IDlqRepository {
  async saveDlqLog(dlqLog: DlqLogEntry): Promise<void> {
    try {
      await DlqLogModel.create(dlqLog);
      console.log(DLQ_MESSAGES.LOG.STORED(dlqLog.playerId, dlqLog.retryCount));
    } catch (error) {
      console.error(DLQ_MESSAGES.LOG.INSERT_ERROR, dlqLog, error);
      throw error;
    }
  }
} 