import { IPlayer } from '../models/player.model';
import { LOG_TYPES } from '../constants/log.constants';

export interface ILogPublisher {
  publish(logData: {
    playerId: string;
    logData: string;
    logType?: typeof LOG_TYPES[keyof typeof LOG_TYPES];
  }): Promise<void>;
}

export interface ICacheService {
  getPlayer(playerId: string): Promise<IPlayer | null>;
  setPlayer(playerId: string, player: IPlayer): Promise<void>;
  deletePlayer(playerId: string): Promise<void>;
  invalidateAllPlayers(): Promise<void>;
}

export interface IPlayerService {
  createPlayer(playerData: Partial<IPlayer>): Promise<IPlayer>;
  getPlayerById(playerId: string): Promise<IPlayer | null>;
  updatePlayer(playerId: string, updateData: Partial<IPlayer>): Promise<IPlayer | null>;
  deletePlayer(playerId: string): Promise<boolean>;
} 