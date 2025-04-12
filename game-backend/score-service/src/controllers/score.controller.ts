import { Request, Response, NextFunction } from 'express';
import { ScoreService } from '../services/score.service';
import { IScoreService } from '../interfaces/service.interfaces';

export class ScoreController {
  private scoreService: IScoreService;

  constructor(scoreService: IScoreService = new ScoreService()) {
    this.scoreService = scoreService;
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
