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

    // Insert sample scores
    await mongoose.connection.collection('scores').insertMany([
      { playerId: 'player1', score: 100 },
      { playerId: 'player1', score: 200 },
      { playerId: 'player2', score: 300 },
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should return top players sorted by total score', async () => {
    const result = await service.getTopPlayers();
    expect(result).toEqual([
      { playerId: 'player1', totalScore: 300 },
      { playerId: 'player2', totalScore: 300 },
    ]);
  });
});
