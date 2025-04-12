export const CONTAINER_SERVICES = {
  LOG_PUBLISHER: 'logPublisher',
  CACHE_SERVICE: 'cacheService',
  PLAYER_SERVICE: 'playerService',
};

export const CONTAINER_ERRORS = {
  SERVICE_NOT_FOUND: (name: string) => `Service ${name} not found in container`,
}; 