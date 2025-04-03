import { Request, Response, NextFunction } from 'express';
import { KafkaProducer } from '../producers/kafka.producer';
import { evaluateLogPriority } from '../utils/priorityEvaluator';
import { LogPriority } from '../constants/priority.enum';
import { env } from '../config/env';

export class LogController {
  private producer: KafkaProducer;

  constructor() {
    this.producer = new KafkaProducer();
  }

  receiveLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playerId, logData, logType } = req.body;

      if (!playerId || !logData) {
        res.status(400).json({ message: 'playerId and logData are required' });
        return;
      }

      const priority = evaluateLogPriority({ playerId, logData, logType });
      const topic =
        priority === LogPriority.HIGH
          ? env.kafkaHighPriorityTopic
          : env.kafkaLowPriorityTopic;

      await this.producer.sendLogToTopic(topic, { playerId, logData, logType });

      res.status(200).json({ message: 'Log received' });
    } catch (error) {
      next(error);
    }
  };
}
