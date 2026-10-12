import mongoose, { Schema, Document } from 'mongoose';

export type Gender = 'male' | 'female';
export type MaritalStatus = 'never_married' | 'divorced' | 'widowed' | 'separated';
export type Religion = 'Hindu' | 'Muslim' | 'Christian' | 'Sikh' | 'Jain' | 'Buddhist' | 'Other';
export type Education = 'HSC' | 'Diploma' | 'Bachelors' | 'Masters' | 'PhD' | 'Other';
export type FamilyType = 'joint' | 'nuclear' | 'extended';
export type FamilyValues = 'traditional' | 'moderate' | 'liberal';
export type Diet = 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan';
export type HabitLevel = 'no' | 'occasionally' | 'yes';
export type VerificationStatus = 'unverified' | 'phone_verified' | 'id_submitted' | 'trust_badge';
export type PhotoVisibility = 'public' | 'selective' | 'protected';
export type JourneyStatus = 'new' | 'active' | 'matched' | 'closed';

export interface IPartnerPreferences {
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
}

export const PartnerPreferencesSchema = new Schema<IPartnerPreferences>(
  {
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
    flexibilityScore: { type: Number, default: 0.7, min: 0, max: 1 },
  },
  { _id: false }
);

export interface ICustomer extends Document {
  profileId: string;
  isClient: boolean;

  // Identity
  fullName: string;
  gender: Gender;
  dob: Date;
  maritalStatus: MaritalStatus;
  heightCm: number;

  // Location
  city: string;
  state: string;
  country: string;
  nativePlace: string;

  // Religion & Community
  religion: Religion;
  caste: string;
  subCaste: string;
  motherTongue: string;
  isManglik: boolean;

  // Education & Career
  education: Education;
  educationField: string;
  occupation: string;
  employer: string;
  annualIncomeINR: number;

  // Family
  familyType: FamilyType;
  familyValues: FamilyValues;
  fatherOccupation: string;
  motherOccupation: string;
  numberOfSiblings: number;

  // Lifestyle
  diet: Diet;
  smoking: HabitLevel;
  drinking: HabitLevel;
  hobbies: string[];

  // Astrological
  rashi: string;
  nakshatra: string;

  // About
  selfDescription: string;

  // Photo
  avatarSeed: string;
  photoVisibility: PhotoVisibility;

  // Verification & Journey Status
  verificationStatus: VerificationStatus;
  journeyStatus: JourneyStatus;

  // Explicit partner preferences
  preferences: IPartnerPreferences;

  // Operational metadata
  onboardedAt: Date;
  assignedMatchmaker?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    profileId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isClient: {
      type: Boolean,
      default: false,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
      index: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: ['never_married', 'divorced', 'widowed', 'separated'],
      default: 'never_married',
    },
    heightCm: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    nativePlace: {
      type: String,
      default: '',
    },
    religion: {
      type: String,
      enum: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'],
      required: true,
      index: true,
    },
    caste: {
      type: String,
      default: '',
    },
    subCaste: {
      type: String,
      default: '',
    },
    motherTongue: {
      type: String,
      required: true,
    },
    isManglik: {
      type: Boolean,
      default: false,
    },
    education: {
      type: String,
      enum: ['HSC', 'Diploma', 'Bachelors', 'Masters', 'PhD', 'Other'],
      required: true,
    },
    educationField: {
      type: String,
      default: '',
    },
    occupation: {
      type: String,
      required: true,
    },
    employer: {
      type: String,
      default: '',
    },
    annualIncomeINR: {
      type: Number,
      required: true,
      default: 0,
    },
    familyType: {
      type: String,
      enum: ['joint', 'nuclear', 'extended'],
      default: 'nuclear',
    },
    familyValues: {
      type: String,
      enum: ['traditional', 'moderate', 'liberal'],
      default: 'moderate',
    },
    fatherOccupation: {
      type: String,
      default: '',
    },
    motherOccupation: {
      type: String,
      default: '',
    },
    numberOfSiblings: {
      type: Number,
      default: 0,
    },
    diet: {
      type: String,
      enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan'],
      default: 'vegetarian',
    },
    smoking: {
      type: String,
      enum: ['no', 'occasionally', 'yes'],
      default: 'no',
    },
    drinking: {
      type: String,
      enum: ['no', 'occasionally', 'yes'],
      default: 'no',
    },
    hobbies: [{ type: String }],
    rashi: {
      type: String,
      default: '',
    },
    nakshatra: {
      type: String,
      default: '',
    },
    selfDescription: {
      type: String,
      default: '',
    },
    avatarSeed: {
      type: String,
      required: true,
    },
    photoVisibility: {
      type: String,
      enum: ['public', 'selective', 'protected'],
      default: 'public',
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'phone_verified', 'id_submitted', 'trust_badge'],
      default: 'phone_verified',
    },
    journeyStatus: {
      type: String,
      enum: ['new', 'active', 'matched', 'closed'],
      default: 'new',
      index: true,
    },
    preferences: {
      type: PartnerPreferencesSchema,
      required: true,
    },
    onboardedAt: {
      type: Date,
      default: Date.now,
    },
    assignedMatchmaker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for fast customer searching
CustomerSchema.index({
  fullName: 'text',
  city: 'text',
  occupation: 'text',
  profileId: 'text',
});

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
export const Candidate = Customer;
