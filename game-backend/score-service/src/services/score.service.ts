import { IScore } from '../models/score.model';
import { SYSTEM_ACTOR, LOG_MESSAGES } from '../constants/log.constants';
import { LogType } from '../constants/log.enums';
import { GENERAL } from '../constants/general.constants';
import { ILogPublisher, ICacheService, IScoreService } from '../interfaces/service.interfaces';
import { IScoreRepository, ScoreRepository } from '../repositories/score.repository';
import { LogPublisher } from '../utils/logPublisher';
import { CacheService } from './cache.service';

export class ScoreService implements IScoreService {
  private logPublisher: ILogPublisher;
  private cacheService: ICacheService;
  private scoreRepository: IScoreRepository;

  constructor(
    logPublisher: ILogPublisher = new LogPublisher(),
    cacheService: ICacheService = new CacheService(),
    scoreRepository: IScoreRepository = new ScoreRepository()
  ) {
    this.logPublisher = logPublisher;
    this.cacheService = cacheService;
    this.scoreRepository = scoreRepository;
  }

  async createScore(data: Partial<IScore>): Promise<IScore> {
    try {
      const score = await this.scoreRepository.create(data);

      const { playerId } = score;
      const scoreValue = score.score;

      if (playerId && typeof scoreValue === 'number') {
        await this.cacheService.addToLeaderboard(playerId, scoreValue);
        await this.cacheService.publishScoreUpdate(playerId, scoreValue);
      }

      await this.logPublisher.publish({
        playerId: String(playerId),
        logData: LOG_MESSAGES.SCORE.SUBMITTED(scoreValue),
        logType: LogType.INFO,
      });

      return score;
    } catch (error: any) {
      await this.logPublisher.publish({
        playerId: data.playerId || GENERAL.UNKNOWN_PLAYER_ID,
        logData: LOG_MESSAGES.SCORE.FAILED_CREATE(error.message),
        logType: LogType.ERROR,
      });
      throw error;
    }
  }

  async getTopScores(limit = 10): Promise<{ playerId: string; score: number }[]> {
    try {
      const top = await this.cacheService.getTopScores(limit);

      await this.logPublisher.publish({
        playerId: SYSTEM_ACTOR,
        logData: LOG_MESSAGES.SCORE.TOP_RETRIEVED(limit),
        logType: LogType.INFO,
      });

      return top;
    } catch (error: any) {
      await this.logPublisher.publish({
        playerId: SYSTEM_ACTOR,
        logData: LOG_MESSAGES.SCORE.FAILED_FETCH(error.message),
        logType: LogType.ERROR,
      });
      throw error;
    }
  }
}
