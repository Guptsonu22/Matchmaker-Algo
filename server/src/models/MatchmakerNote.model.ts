import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchmakerNote extends Document {
  clientId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const MatchmakerNoteSchema = new Schema<IMatchmakerNote>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      required: [true, 'Note text cannot be empty'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MatchmakerNote = mongoose.model<IMatchmakerNote>(
  'MatchmakerNote',
  MatchmakerNoteSchema
);
