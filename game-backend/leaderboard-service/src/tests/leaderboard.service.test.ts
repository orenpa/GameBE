import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { LeaderboardService } from '../services/leaderboard.service';

describe('LeaderboardService', () => {
  let mongoServer: MongoMemoryServer;
  let service: LeaderboardService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    service = new LeaderboardService();

    // Insert sample scores for multiple players
    await mongoose.connection.collection('scores').insertMany([
      { playerId: 'player1', score: 100 },
      { playerId: 'player1', score: 200 },
      { playerId: 'player2', score: 300 },
      { playerId: 'player3', score: 250 },
      { playerId: 'player4', score: 150 },
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should return top players sorted by total score', async () => {
    const result = await service.getTopPlayers();
    expect(result[0]).toEqual({ playerId: 'player1', totalScore: 300 });
    expect(result[1]).toEqual({ playerId: 'player2', totalScore: 300 });
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('should return paginated results', async () => {
    const page = 2;
    const limit = 2;
    const result = await service.getTopPlayers(page, limit);

    expect(result.length).toBe(2); // page 2 with limit 2 should return the 3rd and 4th players
    expect(result[0]).toHaveProperty('playerId');
    expect(result[0]).toHaveProperty('totalScore');
  });
});
