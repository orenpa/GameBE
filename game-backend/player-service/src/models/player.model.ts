import mongoose, { Schema, Document } from 'mongoose';
import { DB_OPTIONS, PLAYER_SCHEMA } from '../constants/database.constants';

export interface IPlayer extends Document {
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const playerSchema = new Schema<IPlayer>(
  {
    [PLAYER_SCHEMA.FIELDS.USERNAME]: {
      type: String,
      required: true,
      trim: true,
    },
    [PLAYER_SCHEMA.FIELDS.EMAIL]: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: PLAYER_SCHEMA.OPTIONS.TIMESTAMPS,
  }
);

const Player = mongoose.model<IPlayer>(DB_OPTIONS.MODELS.PLAYER, playerSchema);
export default Player;
