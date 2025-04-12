import { Request, Response, NextFunction } from 'express';
import { RedisBatchService } from '../services/redis-batch.service';
import { ERROR_MESSAGES } from '../constants/error.constants';
import { LOG_MESSAGES } from '../constants/log.constants';
import { IRedisBatchService } from '../interfaces/service.interfaces';

export class LogController {
  private batchService: IRedisBatchService;

  constructor(batchService: IRedisBatchService = new RedisBatchService()) {
    this.batchService = batchService;
  }

  receiveLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playerId, logData, logType } = req.body;

      if (!playerId || !logData) {
        res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS });
        return;
      }
      
      // Add to Redis batch queue instead of sending directly to Kafka
      await this.batchService.addLog({ 
        playerId, 
        logData, 
        logType
      });

      // Return immediately to the client
      res.status(200).json({ message: LOG_MESSAGES.BATCH_PROCESSING });
    } catch (error) {
      next(error);
    }
  };
}
