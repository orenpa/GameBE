import axios from 'axios';
import { env } from '../config/env';
import { ILogPublisher } from '../interfaces/service.interfaces';
import { LOG_TYPES } from '../constants/log.constants';
import { API_ENDPOINTS } from '../constants/api.constants';

interface LogPayload {
  playerId: string;
  logData: string;
  logType?: typeof LOG_TYPES[keyof typeof LOG_TYPES];
}

export class LogPublisher implements ILogPublisher {
  private logApiUrl: string;

  constructor() {
    this.logApiUrl = env.logApiUrl;
  }

  async publish(log: LogPayload): Promise<void> {
    try {
      await axios.post(`${this.logApiUrl}${API_ENDPOINTS.LOG_API.LOGS}`, log);
    } catch (error) {
      console.error('❌ Failed to send log to log-api-service:', error);
    }
  }
}
