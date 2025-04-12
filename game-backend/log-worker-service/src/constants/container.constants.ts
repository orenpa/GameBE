export const CONTAINER_SERVICES = {
  RATE_LIMITER: 'rateLimiter',
  KAFKA_PRODUCER: 'kafkaProducer',
  LOG_SERVICE: 'logService',
  LOG_CONSUMER: 'logConsumer',
};

export const CONTAINER_ERRORS = {
  SERVICE_NOT_FOUND: (name: string) => `Service ${name} not found in container`,
}; 