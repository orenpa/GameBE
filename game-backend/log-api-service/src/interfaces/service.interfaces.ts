export interface LogEntry {
  playerId: string;
  logData: string;
  logType?: string;
}

export interface IKafkaProducer {
  sendLogToTopic(topic: string, log: LogEntry): Promise<void>;
  sendLogBatchToTopic(topic: string, logs: LogEntry[]): Promise<void>;
  disconnect(): Promise<void>;
}

export interface IRedisLock {
  acquire(): Promise<boolean>;
  release(): Promise<void>;
}

export interface ILogBatchService {
  addLog(log: LogEntry): Promise<void>;
  shutdown(): Promise<void>;
} 