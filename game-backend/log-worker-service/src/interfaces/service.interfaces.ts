export interface LogData {
  playerId: string;
  logData: string;
  logType?: string;
  retryCount?: number;
}

export interface ILogService {
  saveLog(log: LogData): Promise<void>;
  shutdown(): Promise<void>;
}

export interface ILogConsumer {
  subscribe(topic: string): Promise<void>;
  start(): Promise<void>;
  disconnect(): Promise<void>;
}

export interface IRateLimiter {
  wait(): Promise<void>;
}

export interface IKafkaProducer {
  connect(): Promise<void>;
  send(config: {
    topic: string;
    messages: { key: string; value: string }[];
  }): Promise<void>;
  disconnect(): Promise<void>;
} 