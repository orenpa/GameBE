import redisClient from '../config/redis';
import { IPlayer } from '../models/player.model';

const CACHE_TTL = 3600; // 1 hour in seconds
const PLAYER_PREFIX = 'player:';

export class CacheService {
  async getPlayer(playerId: string): Promise<IPlayer | null> {
    try {
      const cachedPlayer = await redisClient.get(`${PLAYER_PREFIX}${playerId}`);
      
      if (cachedPlayer) {
        return JSON.parse(cachedPlayer) as IPlayer;
      }
      
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async setPlayer(playerId: string, player: IPlayer): Promise<void> {
    try {
      await redisClient.set(
        `${PLAYER_PREFIX}${playerId}`,
        JSON.stringify(player),
        { EX: CACHE_TTL }
      );
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async deletePlayer(playerId: string): Promise<void> {
    try {
      await redisClient.del(`${PLAYER_PREFIX}${playerId}`);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async invalidateAllPlayers(): Promise<void> {
    try {
      const keys = await redisClient.keys(`${PLAYER_PREFIX}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Redis invalidate all error:', error);
    }
  }
} 