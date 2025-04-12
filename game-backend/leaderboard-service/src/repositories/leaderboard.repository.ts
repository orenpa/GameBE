import mongoose from 'mongoose';
import { ILeaderboardRepository } from '../interfaces/service.interfaces';
import { LeaderboardEntry } from '../services/leaderboard.service';
import { LEADERBOARD } from '../constants/leaderboard.constants';
import { MONGO_QUERY } from '../constants/mongo.constants';

export class LeaderboardRepository implements ILeaderboardRepository {
  private collection: mongoose.Collection;

  constructor() {
    this.collection = mongoose.connection.collection(LEADERBOARD.COLLECTION_NAME);
  }

  async getTopPlayers(page: number, limit: number, skip: number): Promise<LeaderboardEntry[]> {
    return await this.collection.aggregate<LeaderboardEntry>([
      {
        $group: {
          _id: '$playerId',
          totalScore: { $sum: '$score' },
        },
      },
      {
        $sort: { totalScore: MONGO_QUERY.SORT.DESC, _id: MONGO_QUERY.SORT.ASC },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: MONGO_QUERY.PROJECTION.EXCLUDE_ID,
          playerId: '$_id',
          totalScore: MONGO_QUERY.PROJECTION.INCLUDE,
        },
      },
    ]).toArray();
  }
} 