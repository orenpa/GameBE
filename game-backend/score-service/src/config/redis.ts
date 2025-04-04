import { createClient } from 'redis';
import { env } from './env';
import { ERROR_MESSAGES } from '../constants/error.constants';
import { SERVER_MESSAGES } from '../constants/general.constants';

const redis = createClient({
  url: env.redisUrl,
});

redis.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS.CONNECTION_ERROR, err);
});

redis.on('connect', () => {
  console.log(SERVER_MESSAGES.CONNECTED_REDIS);
});

redis.connect();

export default redis;
