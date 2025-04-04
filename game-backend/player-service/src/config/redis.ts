import { createClient } from 'redis';
import { env } from './env';
import { ERROR_MESSAGES } from '../constants/error.constants';

const redisClient = createClient({
  url: env.redisUrl,
});

redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS.CONNECTION_ERROR, err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error(ERROR_MESSAGES.REDIS.FAILED_CONNECTION, error);
  }
};

export default redisClient;
