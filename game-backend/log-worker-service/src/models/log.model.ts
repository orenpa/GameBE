import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true },
    logData: { type: String, required: true },
    logType: { type: String, enum: ['info', 'error', 'crash', 'critical'], default: 'info' },
  },
  { timestamps: true }
);

export const LogModel = mongoose.model('Log', logSchema);
