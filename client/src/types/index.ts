// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'matchmaker' | 'senior_matchmaker';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Candidate / Client ───────────────────────────────────────────────────────

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

export interface PartnerPreferences {
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

export interface Candidate {
  _id: string;
  profileId: string;
  isClient: boolean;

  // Identity
  fullName: string;
  gender: Gender;
  dob: string; // ISO date string
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

  // Verification
  verificationStatus: VerificationStatus;

  // Preferences
  preferences: PartnerPreferences;

  // CRM (clients only)
  journeyStatus?: JourneyStatus;
  onboardedAt?: string;
  assignedMatchmaker?: string;

  createdAt: string;
  updatedAt: string;
}

export type Client = Candidate & {
  isClient: true;
  journeyStatus: JourneyStatus;
  onboardedAt: string;
};

// ─── Notes ────────────────────────────────────────────────────────────────────

export interface MatcherNote {
  _id: string;
  clientId: string;
  authorId: string;
  authorName: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Match ────────────────────────────────────────────────────────────────────

export interface ScoreDimensions {
  ageCompatibility: number;
  locationMatch: number;
  educationAlignment: number;
  incomeAlignment: number;
  lifestyleHarmony: number;
  culturalFit: number;
  preferenceReciprocity: number;
}

export interface ScoreSnapshot {
  total: number;
  dimensions: ScoreDimensions;
}

export interface MatchSuggestion {
  candidate: Candidate;
  score: ScoreSnapshot;
}

export interface MatchEvent {
  _id: string;
  clientId: string;
  candidateId: string;
  candidate?: Candidate;
  sentBy: string;
  sentByName?: string;
  sentAt: string;
  scoreSnapshot: ScoreSnapshot;
  aiIntroduction: string;
  emailDelivered: boolean;
  emailLog: string;
  notes?: string;
}

// ─── API Responses ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  matchesSentToday: number;
  matchesSentAllTime: number;
  newThisWeek: number;
  closedThisMonth: number;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface CustomerQueryParams {
  search?: string;
  gender?: Gender | '';
  status?: JourneyStatus | '';
  religion?: Religion | '';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
