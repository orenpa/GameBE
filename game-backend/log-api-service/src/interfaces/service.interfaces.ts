export interface LogEntry {
  playerId: string;
  logData: string;
  logType?: string;
}

export interface IKafkaProducer {
  sendLogToTopic(topic: string, log: LogEntry): Promise<void>;
}

export interface IRedisLock {
  acquire(): Promise<boolean>;
  release(): Promise<void>;
}

export interface IRedisBatchService {
  addLog(log: LogEntry): Promise<void>;
  shutdown(): Promise<void>;
} 