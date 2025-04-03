import redis from '../config/redis';
import { env } from '../config/env';
import { KafkaProducer } from '../producers/kafka.producer';

/**
 * A service that batches logs in Redis and periodically flushes them to Kafka
 * This provides several advantages:
 * 1. Reduced Kafka overhead by sending messages in batches
 * 2. Improved throughput by minimizing network calls
 * 3. Better handling of traffic spikes by buffering in Redis
 */
export class RedisBatchService {
  private readonly kafkaProducer: KafkaProducer;
  private readonly highPriorityKey = 'logs:batch:high';
  private readonly lowPriorityKey = 'logs:batch:low'; 
  private readonly batchSize: number;
  private readonly flushIntervalMs: number;
  private flushTimer: NodeJS.Timeout;
  private isProcessing: boolean = false;

  constructor() {
    this.kafkaProducer = new KafkaProducer();
    this.batchSize = env.logBatchSize;
    this.flushIntervalMs = env.logBatchTimeoutMs;
    
    // Start periodic flushing
    this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
    
    // Handle graceful shutdown
    process.on('SIGINT', this.shutdown.bind(this));
    process.on('SIGTERM', this.shutdown.bind(this));
  }

  /**
   * Adds a log to the appropriate Redis queue based on priority
   */
  public async addLog(log: { 
    playerId: string;
    logData: string;
    logType?: string;
    priority: 'high' | 'low';
  }): Promise<void> {
    const { priority, ...logData } = log;
    const key = priority === 'high' ? this.highPriorityKey : this.lowPriorityKey;
    
    // Add log to the appropriate Redis list
    await redis.rPush(key, JSON.stringify(logData));
    
    // If we've reached the batch size, trigger a flush
    const queueLength = await redis.lLen(key);
    if (queueLength >= this.batchSize && !this.isProcessing) {
      // Flush in the background
      this.flush().catch(err => console.error('Flush error:', err));
    }
  }

  /**
   * Flushes logs from Redis to Kafka
   * Uses a locking mechanism to ensure only one flush operation runs at a time
   */
  private async flush(): Promise<void> {
    if (this.isProcessing) {
      return; // Already processing
    }
    
    this.isProcessing = true;
    
    try {
      // Process high priority logs first
      await this.flushQueue(this.highPriorityKey, env.kafkaHighPriorityTopic);
      
      // Then process low priority logs
      await this.flushQueue(this.lowPriorityKey, env.kafkaLowPriorityTopic);
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Flushes a specific queue to a Kafka topic
   */
  private async flushQueue(queueKey: string, kafkaTopic: string): Promise<void> {
    // Get queue length
    const queueLength = await redis.lLen(queueKey);
    
    if (queueLength === 0) {
      return; // Nothing to process
    }
    
    // Process in batches of batchSize
    const batchesToProcess = Math.min(Math.ceil(queueLength / this.batchSize), 5); // Limit to 5 batches per flush
    
    for (let i = 0; i < batchesToProcess; i++) {
      // Use LRANGE and LTRIM in a transaction to atomically get and remove items
      const pipeline = redis.multi();
      pipeline.lRange(queueKey, 0, this.batchSize - 1);
      pipeline.lTrim(queueKey, this.batchSize, -1);
      
      const results = await pipeline.exec();
      if (!results || !results[0]) continue;
      
      // Type assertion here as we know the first result is an array of strings
      const logStrings = results[0] as string[];
      if (!Array.isArray(logStrings) || logStrings.length === 0) {
        break; // No more logs to process
      }
      
      // Parse each JSON string into a log object
      const logs = logStrings.map((item: string) => JSON.parse(item));
      
      // Send logs to Kafka
      for (const log of logs) {
        await this.kafkaProducer.sendLogToTopic(kafkaTopic, log);
      }
      
      console.log(`✅ Sent ${logs.length} ${queueKey} logs to Kafka topic ${kafkaTopic}`);
    }
  }

  /**
   * Gracefully shuts down the service
   */
  public async shutdown(): Promise<void> {
    console.log('🔻 Shutting down Redis batch service...');
    clearInterval(this.flushTimer);
    
    // Final flush of all logs
    await this.flush();
    
    console.log('✅ Redis batch service shutdown complete');
  }
} 