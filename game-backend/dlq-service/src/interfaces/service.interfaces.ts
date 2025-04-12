export interface DlqLogEntry {
  playerId: string;
  logData: string;
  retryCount: number;
  error?: string;
}

export interface IDlqRepository {
  saveDlqLog(dlqLog: DlqLogEntry): Promise<void>;
}

export interface IDlqConsumer {
  start(): Promise<void>;
  disconnect(): Promise<void>;
} 