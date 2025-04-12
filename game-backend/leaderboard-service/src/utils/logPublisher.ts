import axios from 'axios';
import { env } from '../config/env';
import { LOG_PUBLISHER_MESSAGES } from '../constants/log.constants';
import { ILogPublisher } from '../interfaces/service.interfaces';

interface LogPayload {
  playerId: string;
  logData: string;
  logType?: 'info' | 'error' | 'crash' | 'critical';
}

export class LogPublisher implements ILogPublisher {
  private logApiUrl: string;

  constructor() {
    this.logApiUrl = env.logApiUrl;
  }

  async publish(log: LogPayload): Promise<void> {
    try {
      await axios.post(`${this.logApiUrl}/logs`, log);
    } catch (error) {
      console.error(LOG_PUBLISHER_MESSAGES.FAILED_SEND, error);
    }
  }
}
