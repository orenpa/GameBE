import Score, { IScore } from '../models/score.model';
import redis from '../config/redis';

const REDIS_LEADERBOARD_KEY = 'scores:global';

export class ScoreService {
  async createScore(data: Partial<IScore>): Promise<IScore> {
    // 1. Save to Mongo
    const scoreDoc = new Score(data);
    const saved = await scoreDoc.save();

    // 2. Atomically update Redis leaderboard
    const { playerId, score } = saved;

    if (playerId && typeof score === 'number') {
      await redis.zAdd(REDIS_LEADERBOARD_KEY, {
        score,
        value: playerId,
      });
    }

    return saved;
  }

  async getTopScores(limit = 10): Promise<{ playerId: string; score: number }[]> {
    const top = await redis.zRangeWithScores(REDIS_LEADERBOARD_KEY, 0, limit - 1, {
      REV: true, 
    });
  
    return top.map(({ value, score }) => ({
      playerId: value,
      score,
    }));
  }
}
