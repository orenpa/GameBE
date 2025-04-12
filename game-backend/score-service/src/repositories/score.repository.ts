import Score, { IScore } from '../models/score.model';
import { BaseRepository, IRepository } from './base.repository';

export interface IScoreRepository extends IRepository<IScore> {
  // Add score-specific methods here
  findByPlayerId(playerId: string): Promise<IScore[]>;
}

export class ScoreRepository extends BaseRepository<IScore> implements IScoreRepository {
  constructor() {
    super(Score);
  }

  async findByPlayerId(playerId: string): Promise<IScore[]> {
    return await this.model.find({ playerId }).sort({ score: -1 });
  }
} 