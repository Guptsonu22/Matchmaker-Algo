import mongoose, { Schema, Document } from 'mongoose';

export type Gender = 'male' | 'female';
export type MaritalStatus = 'never_married' | 'divorced' | 'widowed' | 'separated';
export type Religion = 'Hindu' | 'Muslim' | 'Christian' | 'Sikh' | 'Jain' | 'Buddhist' | 'Other';
export type Education = 'HSC' | 'Diploma' | 'Bachelors' | 'Masters' | 'PhD' | 'Other';
export type FamilyType = 'joint' | 'nuclear' | 'extended';
export type FamilyValues = 'traditional' | 'moderate' | 'liberal';
export type Diet = 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan';
export type HabitLevel = 'no' | 'occasionally' | 'yes';
export type VerificationStatus = 'unverified' | 'pending' | 'phone_verified' | 'id_submitted' | 'trust_badge';
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
  preferredCities?: string[];
  childrenPreferenceAccepted?: string[];
  relocationPreferenceAccepted?: string[];
  petPreferenceAccepted?: string[];
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
    preferredCities: [{ type: String }],
    childrenPreferenceAccepted: [{ type: String }],
    relocationPreferenceAccepted: [{ type: String }],
    petPreferenceAccepted: [{ type: String }],
  },
  { _id: false }
);

export interface ICustomer extends Document {
  profileId: string;
  isClient: boolean;
  isSynthetic: boolean; // Flag explicitly marking fictional/synthetic profiles

  // Names & Identity
  firstName: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  dob: Date;
  maritalStatus: MaritalStatus;
  heightCm: number;

  // Contact (Fictional only)
  email: string;
  phone: string;

  // Location
  country: string;
  city: string;
  state: string;
  nativePlace: string;

  // Education & Career
  undergraduateCollege: string;
  degree: string;
  education: Education;
  educationField: string;
  annualIncomeINR: number;
  company: string;
  designation: string;
  occupation: string;
  employer: string;
  careerGoals?: string;

  // Background, Community & Languages
  religion: Religion;
  caste: string;
  subCaste: string;
  motherTongue: string;
  languages: string[];
  isManglik: boolean;

  // Family
  familyType: FamilyType;
  familyValues: FamilyValues;
  fatherOccupation: string;
  motherOccupation: string;
  numberOfSiblings: number;
  siblings: string;

  // Life Choices & Preferences
  childrenPreference: string;
  relocationPreference: string;
  petPreference: string;
  relationshipExpectations?: string;

  // Lifestyle & Habits
  diet: Diet;
  smoking: HabitLevel;
  drinking: HabitLevel;
  hobbies: string[];
  lifestylePreferences?: string;

  // Astrological
  rashi: string;
  nakshatra: string;

  // About & Completeness
  selfDescription: string;
  profileCompleteness: number; // percentage (0 - 100)

  // Photo
  avatarSeed: string;
  photoVisibility: PhotoVisibility;

  // Verification & Journey Status
  verificationStatus: VerificationStatus;
  journeyStatus: JourneyStatus;

  // Embedded preferences (also mirrored in separate MatchPreference collection)
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
    isSynthetic: {
      type: Boolean,
      default: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
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
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
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
    nativePlace: {
      type: String,
      default: '',
    },
    undergraduateCollege: {
      type: String,
      default: '',
    },
    degree: {
      type: String,
      default: '',
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
    annualIncomeINR: {
      type: Number,
      required: true,
      default: 0,
    },
    company: {
      type: String,
      default: '',
    },
    designation: {
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
    careerGoals: {
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
    languages: [{ type: String }],
    isManglik: {
      type: Boolean,
      default: false,
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
    siblings: {
      type: String,
      default: 'None',
    },
    childrenPreference: {
      type: String,
      default: 'Wants children in future',
    },
    relocationPreference: {
      type: String,
      default: 'Open to relocating within India',
    },
    petPreference: {
      type: String,
      default: 'Pet friendly',
    },
    relationshipExpectations: {
      type: String,
      default: '',
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
    lifestylePreferences: {
      type: String,
      default: '',
    },
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
    profileCompleteness: {
      type: Number,
      default: 95,
      min: 0,
      max: 100,
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
      enum: ['unverified', 'pending', 'phone_verified', 'id_submitted', 'trust_badge'],
      default: 'unverified',
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

CustomerSchema.index({
  fullName: 'text',
  city: 'text',
  occupation: 'text',
  profileId: 'text',
});

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
export const Candidate = Customer;
