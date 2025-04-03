import { LogModel } from '../models/log.model';

interface LogInput {
  playerId: string;
  logData: string;
}

export class LogService {
  private buffer: LogInput[] = [];
  private readonly batchSize = 10;
  private readonly flushInterval = 2000; // ms
  private flushTimer: NodeJS.Timeout;

  constructor() {
    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
  }

  async saveLog(log: LogInput): Promise<void> {
    this.buffer.push(log);
    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
  
    const batch = [...this.buffer];
    this.buffer = [];
  
    const maxRetries = 3;
    let attempt = 0;
  
    while (attempt < maxRetries) {
      try {
        await LogModel.insertMany(batch);
        console.log(`✅ Flushed ${batch.length} logs to MongoDB`);
        return;
      } catch (error) {
        attempt++;
        const delay = Math.pow(2, attempt) * 100; // 200ms, 400ms, 800ms
        console.error(`❌ Flush attempt ${attempt} failed. Retrying in ${delay}ms...`, error);
  
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  
    console.error(`❌ Failed to flush ${batch.length} logs after ${maxRetries} attempts.`);
  }

  async shutdown(): Promise<void> {
    clearInterval(this.flushTimer);
    await this.flush();
  }
}
