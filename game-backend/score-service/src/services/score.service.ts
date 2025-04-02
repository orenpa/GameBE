import Score, { IScore } from '../models/score.model';

export class ScoreService {
  async createScore(data: Partial<IScore>): Promise<IScore> {
    const score = new Score(data);
    return await score.save();
  }

  async getTopScores(limit = 10): Promise<IScore[]> {
    return await Score.find().sort({ score: -1 }).limit(limit);
  }
}
