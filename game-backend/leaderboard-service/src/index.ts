import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';
import { SYSTEM_MESSAGES } from './constants/system.constants';
import { MONGO_CONFIG } from './constants/mongo.constants';

const startServer = async () => {
  try {
    console.log(SYSTEM_MESSAGES.STARTUP.CONNECTING_MONGODB);
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: MONGO_CONFIG.SERVER_SELECTION_TIMEOUT,
    });
    console.log(SYSTEM_MESSAGES.STARTUP.CONNECTED_MONGODB);

    app.listen(env.port, () => {
      console.log(SYSTEM_MESSAGES.STARTUP.LISTENING(env.port));
    });
  } catch (error) {
    console.error(SYSTEM_MESSAGES.STARTUP.FAILED_STARTUP, error);
    process.exit(1);
  }
};

startServer();
