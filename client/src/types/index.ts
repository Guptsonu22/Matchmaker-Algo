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

export interface ScoreDimensions {
  ageCompatibility: number;
  locationMatch: number;
  educationAlignment: number;
  incomeAlignment: number;
  lifestyleHarmony: number;
  culturalFit: number;
  preferenceReciprocity: number;
  [key: string]: number;
}

export interface ScoreSnapshot {
  total: number;
  dimensions: ScoreDimensions;
}

export interface DimensionDetail {
  score: number;
  maxScore: number;
  percentage: number;
  detail: string;
}

export interface MatchExplanation {
  summary: string;
  positiveSignals: string[];
  mismatches: string[];
  missingInformation: string[];
}

export interface MatchSuggestion {
  candidate: Candidate;
  score: ScoreSnapshot;
  confidence?: number;
  explanation?: MatchExplanation;
  matchedCriteria?: string[];
  potentialConcerns?: string[];
  matchDimensions?: {
    mutualAge?: DimensionDetail;
    children?: DimensionDetail;
    relocation?: DimensionDetail;
    career?: DimensionDetail;
    education?: DimensionDetail;
    lifestyle?: DimensionDetail;
    height?: DimensionDetail;
    income?: DimensionDetail;
    [key: string]: DimensionDetail | undefined;
  };
}

export type MatchStatus =
  | 'shortlisted'
  | 'intro_sent'
  | 'meeting_scheduled'
  | 'accepted'
  | 'rejected'
  | 'proposed'
  | 'viewed'
  | 'declined';

export interface DeliveryReceipt {
  delivered: boolean;
  isMock: boolean;
  provider: string;
  deliveryStatus: 'simulated_delivery' | 'delivered' | 'failed';
  messageId: string;
  timestamp: string;
  summary: string;
  error?: string;
}

export interface MatchEvent {
  _id: string;
  clientId: string;
  candidateId: string;
  candidate?: Candidate;
  sentBy: string;
  sentByName?: string;
  sentAt: string;
  status: MatchStatus;
  scoreSnapshot: ScoreSnapshot;
  aiIntroduction: string;
  emailDelivered: boolean;
  deliveryProvider?: string;
  deliveryStatus?: string;
  isMockDelivery?: boolean;
  deliveryReceipt?: DeliveryReceipt;
  emailLog: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
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

// ─── AI Assisted Introductions ───────────────────────────────────────────────

export interface AIMatchIntroRequest {
  customerId: string;
  candidateId: string;
  score?: ScoreSnapshot | number;
  explanation?: MatchExplanation | string;
}

export interface AIMatchIntroResponse {
  success: boolean;
  introduction: string;
  source: 'ai' | 'fallback';
  fallbackReason?: 'missing_api_key' | 'rate_limited' | 'timeout' | 'api_error';
  wordCount: number;
  modelUsed?: string;
}

