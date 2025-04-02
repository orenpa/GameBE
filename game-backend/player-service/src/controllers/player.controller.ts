import { Request, Response, NextFunction } from 'express';
import { PlayerService } from '../services/player.service';

export class PlayerController {
  private playerService: PlayerService;

  constructor() {
    this.playerService = new PlayerService();
  }

  createPlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const player = await this.playerService.createPlayer(req.body);
      res.status(201).json(player);
    } catch (err) {
      next(err);
    }
  };

  getPlayerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const player = await this.playerService.getPlayerById(req.params.playerId);
      if (!player) {
        res.status(404).json({ message: 'Player not found' });
        return;
      }
      res.json(player);
    } catch (err) {
      next(err);
    }
  };

  updatePlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const player = await this.playerService.updatePlayer(req.params.playerId, req.body);
      if (!player) {
        res.status(404).json({ message: 'Player not found' });
        return;
      }
      res.json(player);
    } catch (err) {
      next(err);
    }
  };

  deletePlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.playerService.deletePlayer(req.params.playerId);
      if (!result) {
        res.status(404).json({ message: 'Player not found' });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
