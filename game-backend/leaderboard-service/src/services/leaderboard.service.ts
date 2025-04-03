import mongoose from 'mongoose';
import { LogPublisher } from '../utils/logPublisher';
import { LogType } from '../constants/log.enums';
import { SYSTEM_ACTOR } from '../constants/log.constants';

const Score = mongoose.connection.collection('scores');

export interface LeaderboardEntry {
  playerId: string;
  totalScore: number;
}

export class LeaderboardService {
  private logPublisher: LogPublisher;

  constructor() {
    this.logPublisher = new LogPublisher();
  }

  async getTopPlayers(page = 1, limit = 10): Promise<LeaderboardEntry[]> {
    const skip = (page - 1) * limit;

    try {
      const result = await Score.aggregate<LeaderboardEntry>([
        {
          $group: {
            _id: '$playerId',
            totalScore: { $sum: '$score' },
          },
        },
        {
          $sort: { totalScore: -1, _id: 1 },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            playerId: '$_id',
            totalScore: 1,
          },
        },
      ]).toArray();

      await this.logPublisher.publish({
        playerId: SYSTEM_ACTOR,
        logData: `📊 Leaderboard retrieved (page ${page}, limit ${limit})`,
        logType: LogType.INFO,
      });

      return result;
    } catch (error: any) {
      await this.logPublisher.publish({
        playerId: SYSTEM_ACTOR,
        logData: `❌ Failed to fetch leaderboard: ${error.message}`,
        logType: LogType.ERROR,
      });

      throw error;
    }
  }
}
