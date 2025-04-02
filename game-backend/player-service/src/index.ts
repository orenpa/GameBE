import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';

const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected to MongoDB');

    app.listen(env.port, () => {
      console.log(`🚀 Player Service listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
