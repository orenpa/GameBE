export interface LogMessage {
    playerId: string;
    logData: string;
  }
  
  export class KafkaProducer {
    async sendLog(message: LogMessage): Promise<void> {
      // Placeholder: this will send the log to Kafka
      console.log('📦 Queued log to Kafka:', message);
    }
  }
  