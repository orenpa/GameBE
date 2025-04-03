import { Request, Response, NextFunction } from 'express';
import { evaluateLogPriority } from '../utils/priorityEvaluator';
import { LogPriority } from '../constants/priority.enum';
import { RedisBatchService } from '../services/redis-batch.service';

export class LogController {
  private batchService: RedisBatchService;

  constructor() {
    this.batchService = new RedisBatchService();
  }

  receiveLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playerId, logData, logType } = req.body;

      if (!playerId || !logData) {
        res.status(400).json({ message: 'playerId and logData are required' });
        return;
      }

      // Determine priority
      const priority = evaluateLogPriority({ playerId, logData, logType });
      
      // Add to Redis batch queue instead of sending directly to Kafka
      await this.batchService.addLog({ 
        playerId, 
        logData, 
        logType,
        priority: priority === LogPriority.HIGH ? 'high' : 'low'
      });

      // Return immediately to the client
      res.status(200).json({ message: 'Log received' });
    } catch (error) {
      next(error);
    }
  };
}
