export const CONTAINER_SERVICES = {
  RATE_LIMITER: 'rateLimiter',
  KAFKA_PRODUCER: 'kafkaProducer',
  RETRY_SERVICE: 'retryService',
  RETRY_CONSUMER: 'retryConsumer',
};

export const CONTAINER_ERRORS = {
  SERVICE_NOT_FOUND: (name: string) => `Service ${name} not found in container`,
}; 