import { Request, Response, NextFunction } from 'express';
import { LeaderboardService } from '../services/leaderboard.service';

export class LeaderboardController {
  private leaderboardService: LeaderboardService;

  constructor() {
    this.leaderboardService = new LeaderboardService();
  }

  getTopPlayers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
  
      const leaderboard = await this.leaderboardService.getTopPlayers(page, limit);
      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  };
  
}
