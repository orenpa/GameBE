export const CONTAINER_SERVICES = {
  LOG_PUBLISHER: 'logPublisher',
  CACHE_SERVICE: 'cacheService',
  SCORE_SERVICE: 'scoreService',
  SCORE_REPOSITORY: 'scoreRepository',
};

export const CONTAINER_ERRORS = {
  SERVICE_NOT_FOUND: (name: string) => `Service ${name} not found in container`,
}; 