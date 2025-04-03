import mongoose from 'mongoose';

const Score = mongoose.connection.collection('scores');

export interface LeaderboardEntry {
  playerId: string;
  totalScore: number;
}

export class LeaderboardService {
  async getTopPlayers(page = 1, limit = 10): Promise<LeaderboardEntry[]> {
    const skip = (page - 1) * limit;
  
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
  
    return result;
  }  
}
