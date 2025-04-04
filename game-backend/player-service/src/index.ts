import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';
import { connectRedis } from './config/redis';
import { SERVER_MESSAGES } from './constants/general.constants';
import { ERROR_MESSAGES } from './constants/error.constants';

const startServer = async () => {
  try {
    console.log(SERVER_MESSAGES.CONNECTING_MONGO);
    await mongoose.connect(env.mongoUri);
    console.log(SERVER_MESSAGES.CONNECTED_MONGO);

    console.log(SERVER_MESSAGES.CONNECTING_REDIS);
    await connectRedis();
    console.log(SERVER_MESSAGES.CONNECTED_REDIS);

    app.listen(env.port, () => {
      console.log(SERVER_MESSAGES.SERVER_LISTENING(env.port));
    });
  } catch (error) {
    console.error(ERROR_MESSAGES.SERVER.FAILED_START, error);
    process.exit(1);
  }
};

startServer();
