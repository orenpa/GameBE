export const CONTAINER_SERVICES = {
  KAFKA_PRODUCER: 'kafkaProducer',
  REDIS_BATCH_SERVICE: 'redisBatchService',
};

export const CONTAINER_ERRORS = {
  SERVICE_NOT_FOUND: (name: string) => `Service ${name} not found in container`,
}; 