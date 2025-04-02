import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const playerSchema = new Schema<IPlayer>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const Player = mongoose.model<IPlayer>('Player', playerSchema);
export default Player;
