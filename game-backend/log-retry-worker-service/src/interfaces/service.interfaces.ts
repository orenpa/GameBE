import { RetryLog } from './retry.interface';

export interface IRetryService {
  handleRetry(log: RetryLog): Promise<void>;
  shutdown(): Promise<void>;
}

export interface IRetryConsumer {
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