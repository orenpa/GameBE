import { createClient } from 'redis';
import dotenv from 'dotenv';
import { LeaderboardService } from '../services/leaderboard.service';

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Create a separate subscriber client for Pub/Sub
const subscriber = redis.duplicate();

// Subscribe to score updates
subscriber.subscribe('score:updates', (message) => {
  console.log('Received score update:', message);
  // Invalidate cache when score updates are received
  const leaderboardService = new LeaderboardService();
  leaderboardService.invalidateCache().catch(console.error);
});

subscriber.on('error', (err) => {
  console.error('❌ Redis subscriber error:', err);
});

redis.connect();
subscriber.connect();

export default redis;
