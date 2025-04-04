import Player, { IPlayer } from '../models/player.model';
import { LogPublisher } from '../utils/logPublisher';
import { CacheService } from './cache.service';

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
        logData: `✅ Player created: ${saved.email}`,
        logType: 'info',
      });

      return saved;
    } catch (error: any) {
      await this.logPublisher.publish({
        playerId: 'unknown',
        logData: `❌ Failed to create player: ${error.message}`,
        logType: 'error',
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
        logData: `✅ Retrieved player profile from cache`,
        logType: 'info',
      });
      return cachedPlayer;
    }
    
    // If not in cache, query from database
    const player = await Player.findById(playerId);
  
    if (!player) {
      await this.logPublisher.publish({
        playerId,
        logData: `❌ Player not found`,
        logType: 'error',
      });
      return null;
    }
  
    // Cache the player for future requests
    await this.cacheService.setPlayer(playerId, player);
    
    await this.logPublisher.publish({
      playerId,
      logData: `✅ Retrieved player profile from database`,
      logType: 'info',
    });
  
    return player;
  }
  

  async updatePlayer(playerId: string, data: Partial<IPlayer>): Promise<IPlayer | null> {
    const updatedPlayer = await Player.findByIdAndUpdate(playerId, data, {
      new: true,
      runValidators: true,
    });
  
    if (!updatedPlayer) {
      await this.logPublisher.publish({
        playerId,
        logData: `❌ Failed to update: Player not found`,
        logType: 'error',
      });
      return null;
    }
    
    // Update the cache with the new player data
    await this.cacheService.setPlayer(playerId, updatedPlayer);
  
    await this.logPublisher.publish({
      playerId,
      logData: `✅ Updated player profile`,
      logType: 'info',
    });
  
    return updatedPlayer;
  }
  

  async deletePlayer(playerId: string): Promise<IPlayer | null> {
    const deletedPlayer = await Player.findByIdAndDelete(playerId);
  
    if (!deletedPlayer) {
      await this.logPublisher.publish({
        playerId,
        logData: `❌ Failed to delete: Player not found`,
        logType: 'error',
      });
      return null;
    }
    
    // Remove the player from cache
    await this.cacheService.deletePlayer(playerId);
  
    await this.logPublisher.publish({
      playerId,
      logData: `🗑️ Deleted player profile`,
      logType: 'info',
    });
  
    return deletedPlayer;
  }
  
}
