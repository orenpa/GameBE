import { IPlayer } from '../models/player.model';

export interface ILogPublisher {
  publish(logData: {
    playerId: string;
    logData: string;
    logType?: 'info' | 'error' | 'crash' | 'critical';
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