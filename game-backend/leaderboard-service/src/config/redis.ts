import { createClient } from 'redis';
import { env } from './env';
import { REDIS_MESSAGES } from '../constants/redis.constants';
import { CACHE_CONFIG, CACHE_MESSAGES } from '../constants/cache.constants';
import { LeaderboardService } from '../services/leaderboard.service';

const redis = createClient({
  url: env.redisUrl,
});

redis.on('error', (err) => {
  console.error(REDIS_MESSAGES.CONNECTION.ERROR, err);
});

redis.on('connect', () => {
  console.log(REDIS_MESSAGES.CONNECTION.CONNECTED);
});

// Create subscriber for cache invalidation
const subscriber = createClient({
  url: env.redisUrl,
});

subscriber.on('error', (err) => {
  console.error(REDIS_MESSAGES.CONNECTION.SUBSCRIBER_ERROR, err);
});

// Connect clients
redis.connect().catch(console.error);
subscriber.connect().catch(console.error);

// Create a separate subscriber client for Pub/Sub
const subscriberClient = redis.duplicate();

// Subscribe to score updates
subscriberClient.subscribe(CACHE_CONFIG.SCORE_UPDATE_CHANNEL, (message) => {
  console.log(CACHE_MESSAGES.SCORE_UPDATE, message);
  // Invalidate cache when score updates are received
  const leaderboardService = new LeaderboardService();
  leaderboardService.invalidateCache().catch(console.error);
});

export default redis;
export { subscriber };
