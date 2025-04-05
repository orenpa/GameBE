import mongoose from 'mongoose';
import { LOG_TYPES } from '../constants/log.constants';

const logSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true },
    logData: { type: String, required: true },
    logType: { type: String, enum: Object.values(LOG_TYPES), default: LOG_TYPES.INFO },
  },
  { timestamps: true }
);

export const LogModel = mongoose.model('Log', logSchema);
