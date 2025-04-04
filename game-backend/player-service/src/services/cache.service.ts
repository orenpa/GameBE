import redisClient from '../config/redis';
import { IPlayer } from '../models/player.model';
import { CACHE } from '../constants/cache.constants';
import { ERROR_MESSAGES } from '../constants/error.constants';

export class CacheService {
  async getPlayer(playerId: string): Promise<IPlayer | null> {
    try {
      const cachedPlayer = await redisClient.get(`${CACHE.PREFIX.PLAYER}${playerId}`);
      
      if (cachedPlayer) {
        return JSON.parse(cachedPlayer) as IPlayer;
      }
      
      return null;
    } catch (error) {
      console.error(ERROR_MESSAGES.REDIS.GET_ERROR, error);
      return null;
    }
  }

  async setPlayer(playerId: string, player: IPlayer): Promise<void> {
    try {
      await redisClient.set(
        `${CACHE.PREFIX.PLAYER}${playerId}`,
        JSON.stringify(player),
        { EX: CACHE.TTL.PLAYER }
      );
    } catch (error) {
      console.error(ERROR_MESSAGES.REDIS.SET_ERROR, error);
    }
  }

  async deletePlayer(playerId: string): Promise<void> {
    try {
      await redisClient.del(`${CACHE.PREFIX.PLAYER}${playerId}`);
    } catch (error) {
      console.error(ERROR_MESSAGES.REDIS.DELETE_ERROR, error);
    }
  }

  async invalidateAllPlayers(): Promise<void> {
    try {
      const keys = await redisClient.keys(`${CACHE.PREFIX.PLAYER}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.REDIS.INVALIDATE_ALL_ERROR, error);
    }
  }
} 