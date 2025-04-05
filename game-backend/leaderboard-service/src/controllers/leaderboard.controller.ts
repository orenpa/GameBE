import { Request, Response, NextFunction } from 'express';
import { LeaderboardService } from '../services/leaderboard.service';
import { LEADERBOARD } from '../constants/leaderboard.constants';

export class LeaderboardController {
  private leaderboardService: LeaderboardService;

  constructor() {
    this.leaderboardService = new LeaderboardService();
  }

  getTopPlayers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || LEADERBOARD.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit as string) || LEADERBOARD.DEFAULT_LIMIT;
  
      const leaderboard = await this.leaderboardService.getTopPlayers(page, limit);
      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  };
  
}
