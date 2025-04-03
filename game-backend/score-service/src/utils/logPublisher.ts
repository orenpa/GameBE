import axios from 'axios';
import { env } from '../config/env';

interface LogPayload {
  playerId: string;
  logData: string;
  logType?: 'info' | 'error' | 'crash' | 'critical';
}

export class LogPublisher {
  private logApiUrl: string;

  constructor() {
    this.logApiUrl = env.logApiUrl;
  }

  async publish(log: LogPayload): Promise<void> {
    try {
      await axios.post(`${this.logApiUrl}/logs`, log);
    } catch (error) {
      console.error('❌ Failed to send log to log-api-service:', error);
    }
  }
}
