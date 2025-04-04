import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';
import './config/redis';
import { SERVER_MESSAGES } from './constants/general.constants';
import { ERROR_MESSAGES } from './constants/error.constants';
import { DB_OPTIONS } from './constants/database.constants';

const startServer = async () => {
  try {
    console.log(SERVER_MESSAGES.CONNECTING_MONGO);
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: DB_OPTIONS.CONNECTION.SERVER_SELECTION_TIMEOUT_MS,
    });
    console.log(SERVER_MESSAGES.CONNECTED_MONGO);

    app.listen(env.port, () => {
      console.log(SERVER_MESSAGES.SERVER_LISTENING(env.port));
    });
  } catch (error) {
    console.error(ERROR_MESSAGES.SERVER.FAILED_START, error);
    process.exit(1);
  }
};

startServer();
