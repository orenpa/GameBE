import { Request, Response, NextFunction } from 'express';
import { LeaderboardService } from '../services/leaderboard.service';
import { LEADERBOARD } from '../constants/leaderboard.constants';
import { ILeaderboardService } from '../interfaces/service.interfaces';

export class LeaderboardController {
  private leaderboardService: ILeaderboardService;

  constructor(leaderboardService: ILeaderboardService = new LeaderboardService()) {
    this.leaderboardService = leaderboardService;
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
