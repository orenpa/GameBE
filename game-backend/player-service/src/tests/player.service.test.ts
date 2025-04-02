import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PlayerService } from '../services/player.service';
import Player from '../models/player.model';

describe('PlayerService', () => {
  let mongoServer: MongoMemoryServer;
  let service: PlayerService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    service = new PlayerService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Player.deleteMany({});
  });

  it('should create a new player', async () => {
    const input = { username: 'testuser', email: 'test@example.com' };
    const result = await service.createPlayer(input);
    expect(result).toHaveProperty('_id');
    expect(result.username).toBe('testuser');
    expect(result.email).toBe('test@example.com');
  });

  it('should return null for non-existing player', async () => {
    const result = await service.getPlayerById('507f1f77bcf86cd799439011');
    expect(result).toBeNull();
  });
});
