import mongoose from 'mongoose';

const dlqLogSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true },
    logData: { type: String, required: true },
    retryCount: { type: Number, required: true },
    error: { type: String, required: true },
  },
  { timestamps: true }
);

export const DlqLogModel = mongoose.model('DlqLog', dlqLogSchema);
