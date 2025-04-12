import Player, { IPlayer } from '../models/player.model';
import { BaseRepository, IRepository } from './base.repository';

export interface IPlayerRepository extends IRepository<IPlayer> {
  // Add player-specific methods here
  findByEmail(email: string): Promise<IPlayer | null>;
}

export class PlayerRepository extends BaseRepository<IPlayer> implements IPlayerRepository {
  constructor() {
    super(Player);
  }

  async findByEmail(email: string): Promise<IPlayer | null> {
    return await this.model.findOne({ email });
  }
} 