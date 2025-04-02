import { Request, Response, NextFunction } from 'express';
import { ScoreService } from '../services/score.service';


export class ScoreController {
  private scoreService: ScoreService;

  constructor() {
    this.scoreService = new ScoreService();
  }

  createScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const score = await this.scoreService.createScore(req.body);
      res.status(201).json(score);
    } catch (err) {
      next(err);
    }
  };

  getTopScores = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topScores = await this.scoreService.getTopScores();
      res.json(topScores);
    } catch (err) {
      next(err);
    }
  };
}
