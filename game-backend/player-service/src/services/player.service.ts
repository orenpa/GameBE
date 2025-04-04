import Player, { IPlayer } from '../models/player.model';
import { LogPublisher } from '../utils/logPublisher';
import { CacheService } from './cache.service';
import { LOG_MESSAGES, LOG_TYPE } from '../constants/log.constants';
import { GENERAL } from '../constants/general.constants';
import { DB_OPTIONS } from '../constants/database.constants';

export class PlayerService {
  private logPublisher: LogPublisher;
  private cacheService: CacheService;

  constructor() {
    this.logPublisher = new LogPublisher();
    this.cacheService = new CacheService();
  }

  async createPlayer(data: Partial<IPlayer>): Promise<IPlayer> {
    try {
      const player = new Player(data);
      const saved = await player.save();

      // Cache the new player
      await this.cacheService.setPlayer(String(saved._id), saved);

      await this.logPublisher.publish({
        playerId: String(saved._id),
        logData: LOG_MESSAGES.PLAYER.CREATED(saved.email),
        logType: LOG_TYPE.INFO,
      });

      return saved;
    } catch (error: any) {
      await this.logPublisher.publish({
        playerId: GENERAL.UNKNOWN_PLAYER_ID,
        logData: LOG_MESSAGES.PLAYER.FAILED_CREATE(error.message),
        logType: LOG_TYPE.ERROR,
      });

      throw error;
    }
  }

  async getPlayerById(playerId: string): Promise<IPlayer | null> {
    // Try to get player from cache first
    const cachedPlayer = await this.cacheService.getPlayer(playerId);
    if (cachedPlayer) {
      await this.logPublisher.publish({
        playerId,
        logData: LOG_MESSAGES.PLAYER.RETRIEVED_CACHE,
        logType: LOG_TYPE.INFO,
      });
      return cachedPlayer;
    }
    
    // If not in cache, query from database
    const player = await Player.findById(playerId);
  
    if (!player) {
      await this.logPublisher.publish({
        playerId,
        logData: LOG_MESSAGES.PLAYER.NOT_FOUND,
        logType: LOG_TYPE.ERROR,
      });
      return null;
    }
  
    // Cache the player for future requests
    await this.cacheService.setPlayer(playerId, player);
    
    await this.logPublisher.publish({
      playerId,
      logData: LOG_MESSAGES.PLAYER.RETRIEVED_DB,
      logType: LOG_TYPE.INFO,
    });
  
    return player;
  }
  

  async updatePlayer(playerId: string, data: Partial<IPlayer>): Promise<IPlayer | null> {
    const updatedPlayer = await Player.findByIdAndUpdate(
      playerId, 
      data, 
      DB_OPTIONS.UPDATE.RETURN_NEW
    );
  
    if (!updatedPlayer) {
      await this.logPublisher.publish({
        playerId,
        logData: LOG_MESSAGES.PLAYER.FAILED_UPDATE,
        logType: LOG_TYPE.ERROR,
      });
      return null;
    }
    
    // Update the cache with the new player data
    await this.cacheService.setPlayer(playerId, updatedPlayer);
  
    await this.logPublisher.publish({
      playerId,
      logData: LOG_MESSAGES.PLAYER.UPDATED,
      logType: LOG_TYPE.INFO,
    });
  
    return updatedPlayer;
  }
  

  async deletePlayer(playerId: string): Promise<IPlayer | null> {
    const deletedPlayer = await Player.findByIdAndDelete(playerId);
  
    if (!deletedPlayer) {
      await this.logPublisher.publish({
        playerId,
        logData: LOG_MESSAGES.PLAYER.FAILED_DELETE,
        logType: LOG_TYPE.ERROR,
      });
      return null;
    }
    
    // Remove the player from cache
    await this.cacheService.deletePlayer(playerId);
  
    await this.logPublisher.publish({
      playerId,
      logData: LOG_MESSAGES.PLAYER.DELETED,
      logType: LOG_TYPE.INFO,
    });
  
    return deletedPlayer;
  }
}
