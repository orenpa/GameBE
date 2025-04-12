import { IPlayer } from '../models/player.model';
import { LOG_MESSAGES, LOG_TYPE } from '../constants/log.constants';
import { GENERAL } from '../constants/general.constants';
import { ICacheService, ILogPublisher, IPlayerService } from '../interfaces/service.interfaces';
import { IPlayerRepository, PlayerRepository } from '../repositories/player.repository';

export class PlayerService implements IPlayerService {
  private logPublisher: ILogPublisher;
  private cacheService: ICacheService;
  private playerRepository: IPlayerRepository;

  constructor(
    logPublisher: ILogPublisher,
    cacheService: ICacheService,
    playerRepository: IPlayerRepository = new PlayerRepository()
  ) {
    this.logPublisher = logPublisher;
    this.cacheService = cacheService;
    this.playerRepository = playerRepository;
  }

  async createPlayer(data: Partial<IPlayer>): Promise<IPlayer> {
    try {
      const player = await this.playerRepository.create(data);

      // Cache the new player
      await this.cacheService.setPlayer(String(player._id), player);

      await this.logPublisher.publish({
        playerId: String(player._id),
        logData: LOG_MESSAGES.PLAYER.CREATED(player.email),
        logType: LOG_TYPE.INFO,
      });

      return player;
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
    const player = await this.playerRepository.findById(playerId);
  
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
    const updatedPlayer = await this.playerRepository.update(playerId, data);
  
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
  

  async deletePlayer(playerId: string): Promise<boolean> {
    const deletedPlayer = await this.playerRepository.delete(playerId);
  
    if (!deletedPlayer) {
      await this.logPublisher.publish({
        playerId,
        logData: LOG_MESSAGES.PLAYER.FAILED_DELETE,
        logType: LOG_TYPE.ERROR,
      });
      return false;
    }
    
    // Remove the player from cache
    await this.cacheService.deletePlayer(playerId);
  
    await this.logPublisher.publish({
      playerId,
      logData: LOG_MESSAGES.PLAYER.DELETED,
      logType: LOG_TYPE.INFO,
    });
  
    return true;
  }
}
