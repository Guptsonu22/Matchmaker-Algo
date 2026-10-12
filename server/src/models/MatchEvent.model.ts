import mongoose, { Schema, Document } from 'mongoose';

export interface IScoreDimensions {
  ageCompatibility: number;
  locationMatch: number;
  educationAlignment: number;
  incomeAlignment: number;
  lifestyleHarmony: number;
  culturalFit: number;
  preferenceReciprocity: number;
}

export interface IScoreSnapshot {
  total: number;
  dimensions: IScoreDimensions;
}

export interface IMatchEvent extends Document {
  clientId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  sentBy: mongoose.Types.ObjectId;
  sentByName: string;
  sentAt: Date;
  status: 'proposed' | 'accepted' | 'declined' | 'viewed';
  scoreSnapshot: IScoreSnapshot;
  aiIntroduction: string;
  emailDelivered: boolean;
  emailLog: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScoreDimensionsSchema = new Schema<IScoreDimensions>(
  {
    ageCompatibility: { type: Number, required: true },
    locationMatch: { type: Number, required: true },
    educationAlignment: { type: Number, required: true },
    incomeAlignment: { type: Number, required: true },
    lifestyleHarmony: { type: Number, required: true },
    culturalFit: { type: Number, required: true },
    preferenceReciprocity: { type: Number, required: true },
  },
  { _id: false }
);

const ScoreSnapshotSchema = new Schema<IScoreSnapshot>(
  {
    total: { type: Number, required: true },
    dimensions: { type: ScoreDimensionsSchema, required: true },
  },
  { _id: false }
);

const MatchEventSchema = new Schema<IMatchEvent>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sentByName: {
      type: String,
      default: 'Matchmaker',
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'declined', 'viewed'],
      default: 'proposed',
    },
    scoreSnapshot: {
      type: ScoreSnapshotSchema,
      required: true,
    },
    aiIntroduction: {
      type: String,
      required: true,
    },
    emailDelivered: {
      type: Boolean,
      default: true,
    },
    emailLog: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const MatchEvent = mongoose.model<IMatchEvent>('MatchEvent', MatchEventSchema);
