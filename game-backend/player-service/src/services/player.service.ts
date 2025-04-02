import Player, { IPlayer } from '../models/player.model';

export class PlayerService {
  async createPlayer(data: Partial<IPlayer>): Promise<IPlayer> {
    const player = new Player(data);
    return await player.save();
  }

  async getPlayerById(playerId: string): Promise<IPlayer | null> {
    return await Player.findById(playerId);
  }

  async updatePlayer(playerId: string, data: Partial<IPlayer>): Promise<IPlayer | null> {
    return await Player.findByIdAndUpdate(playerId, data, { new: true, runValidators: true });
  }

  async deletePlayer(playerId: string): Promise<IPlayer | null> {
    return await Player.findByIdAndDelete(playerId);
  }
}
