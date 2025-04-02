import mongoose, { Schema, Document } from 'mongoose';

export interface IScore extends Document {
  playerId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const scoreSchema = new Schema<IScore>(
  {
    playerId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Score = mongoose.model<IScore>('Score', scoreSchema);
export default Score;
