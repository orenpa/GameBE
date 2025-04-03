import Player, { IPlayer } from '../models/player.model';
import { LogPublisher } from '../utils/logPublisher';

export class PlayerService {
  private logPublisher: LogPublisher;

  constructor() {
    this.logPublisher = new LogPublisher();
  }

  async createPlayer(data: Partial<IPlayer>): Promise<IPlayer> {
    try {
      const player = new Player(data);
      const saved = await player.save();

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
    const player = await Player.findById(playerId);
  
    if (!player) {
      await this.logPublisher.publish({
        playerId,
        logData: `❌ Player not found`,
        logType: 'error',
      });
      return null;
    }
  
    await this.logPublisher.publish({
      playerId,
      logData: `✅ Retrieved player profile`,
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
  
    await this.logPublisher.publish({
      playerId,
      logData: `🗑️ Deleted player profile`,
      logType: 'info',
    });
  
    return deletedPlayer;
  }
  
}
