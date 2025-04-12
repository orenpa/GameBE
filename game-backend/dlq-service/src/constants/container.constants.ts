export const CONTAINER_SERVICES = {
  DLQ_REPOSITORY: 'dlqRepository',
  DLQ_CONSUMER: 'dlqConsumer',
};

export const CONTAINER_ERRORS = {
  SERVICE_NOT_FOUND: (name: string) => `Service ${name} not found in container`,
}; 