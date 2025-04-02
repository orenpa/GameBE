import { Request, Response, NextFunction } from 'express';
import { LeaderboardService } from '../services/leaderboard.service';

export class LeaderboardController {
  private leaderboardService: LeaderboardService;

  constructor() {
    this.leaderboardService = new LeaderboardService();
  }

  getTopPlayers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const leaderboard = await this.leaderboardService.getTopPlayers();
      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  };
}
