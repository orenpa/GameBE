import mongoose, { Schema, Document } from 'mongoose';
import { DB_OPTIONS, SCORE_SCHEMA } from '../constants/database.constants';

export interface IScore extends Document {
  playerId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const scoreSchema = new Schema<IScore>(
  {
    [SCORE_SCHEMA.FIELDS.PLAYER_ID]: {
      type: String,
      required: true,
    },
    [SCORE_SCHEMA.FIELDS.SCORE]: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: SCORE_SCHEMA.OPTIONS.TIMESTAMPS,
  }
);

const Score = mongoose.model<IScore>(DB_OPTIONS.MODELS.SCORE, scoreSchema);
export default Score;
