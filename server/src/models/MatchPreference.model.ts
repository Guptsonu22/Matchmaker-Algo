import mongoose, { Schema, Document } from 'mongoose';
import { Education, Diet, MaritalStatus } from './Customer.model.js';

export interface IMatchPreference extends Document {
  candidateId: mongoose.Types.ObjectId;
  ageMin: number;
  ageMax: number;
  heightMinCm: number;
  heightMaxCm: number;
  religionAccepted: string[];
  casteNoBar: boolean;
  educationMin: Education;
  incomeMinINR: number;
  locationPreference: string[];
  diet: Diet[];
  maritalStatusAccepted: MaritalStatus[];
  flexibilityScore: number;
  preferredCities: string[];
  childrenPreferenceAccepted: string[];
  relocationPreferenceAccepted: string[];
  petPreferenceAccepted: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MatchPreferenceSchema = new Schema<IMatchPreference>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      unique: true,
      index: true,
    },
    ageMin: { type: Number, required: true, default: 21 },
    ageMax: { type: Number, required: true, default: 45 },
    heightMinCm: { type: Number, required: true, default: 140 },
    heightMaxCm: { type: Number, required: true, default: 210 },
    religionAccepted: [{ type: String }],
    casteNoBar: { type: Boolean, default: true },
    educationMin: {
      type: String,
      enum: ['HSC', 'Diploma', 'Bachelors', 'Masters', 'PhD', 'Other'],
      default: 'Bachelors',
    },
    incomeMinINR: { type: Number, default: 0 },
    locationPreference: [{ type: String }],
    diet: [{ type: String }],
    maritalStatusAccepted: [{ type: String }],
    flexibilityScore: { type: Number, default: 0.75, min: 0, max: 1 },
    preferredCities: [{ type: String }],
    childrenPreferenceAccepted: [{ type: String }],
    relocationPreferenceAccepted: [{ type: String }],
    petPreferenceAccepted: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const MatchPreference = mongoose.model<IMatchPreference>(
  'MatchPreference',
  MatchPreferenceSchema
);
