export const CONTAINER_SERVICES = {
  KAFKA_PRODUCER: 'kafkaProducer',
  LOG_BATCH_SERVICE: 'logBatchService',
};

export const CONTAINER_ERRORS = {
  SERVICE_NOT_FOUND: (name: string) => `Service ${name} not found in container`,
}; 