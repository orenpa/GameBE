import { Request, Response, NextFunction } from 'express';
import { KafkaProducer } from '../producers/kafka.producer';

export class LogController {
  private producer: KafkaProducer;

  constructor() {
    this.producer = new KafkaProducer();
  }

  receiveLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playerId, logData } = req.body;

      if (!playerId || !logData) {
        res.status(400).json({ message: 'playerId and logData are required' });
        return;
      }

      await this.producer.sendLog({ playerId, logData });

      res.status(200).json({ message: 'Log received' });
    } catch (error) {
      next(error);
    }
  };
}
