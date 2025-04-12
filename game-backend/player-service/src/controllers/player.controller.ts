import { Request, Response, NextFunction } from 'express';
import { PlayerService } from '../services/player.service';
import { IPlayerService } from '../interfaces/service.interfaces';
import { serviceFactory } from '../factories/service.factory';
import { HTTP_STATUS } from '../constants/http.constants';
import { LOG_MESSAGES } from '../constants/log.constants';

export class PlayerController {
  private playerService: IPlayerService;

  constructor(playerService: IPlayerService = serviceFactory.createPlayerService()) {
    this.playerService = playerService;
  }

  createPlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const player = await this.playerService.createPlayer(req.body);
      res.status(HTTP_STATUS.CREATED).json(player);
    } catch (err) {
      next(err);
    }
  };

  getPlayerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const player = await this.playerService.getPlayerById(req.params.playerId);
      if (!player) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: LOG_MESSAGES.PLAYER.NOT_FOUND });
        return;
      }
      res.status(HTTP_STATUS.OK).json(player);
    } catch (err) {
      next(err);
    }
  };

  updatePlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const player = await this.playerService.updatePlayer(req.params.playerId, req.body);
      if (!player) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: LOG_MESSAGES.PLAYER.NOT_FOUND });
        return;
      }
      res.status(HTTP_STATUS.OK).json(player);
    } catch (err) {
      next(err);
    }
  };

  deletePlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.playerService.deletePlayer(req.params.playerId);
      if (!result) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: LOG_MESSAGES.PLAYER.NOT_FOUND });
        return;
      }
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };
}
