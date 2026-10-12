export type Gender = 'male' | 'female' | string;
export type MaritalStatus = 'never_married' | 'divorced' | 'widowed' | 'separated' | string;
export type Education = 'HSC' | 'Diploma' | 'Bachelors' | 'Masters' | 'PhD' | 'Other' | string;
export type Diet = 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan' | string;
export type HabitLevel = 'no' | 'occasionally' | 'yes' | string;

export interface CustomerPartnerPreferences {
  targetGender?: Gender;
  ageMin?: number;
  ageMax?: number;
  heightMinCm?: number;
  heightMaxCm?: number;
  educationMin?: Education;
  incomeMinINR?: number;
  locationPreference?: string[];
  preferredCities?: string[];
  diet?: Diet[];
  smokingAccepted?: HabitLevel[];
  drinkingAccepted?: HabitLevel[];
  maritalStatusAccepted?: MaritalStatus[];
  childrenPreferenceAccepted?: string[];
  relocationPreferenceAccepted?: string[];
  petPreferenceAccepted?: string[];
  hobbies?: string[];

  // Explicit hard constraints (opt-in only)
  strictAge?: boolean;
  strictMaritalStatus?: boolean;
  strictRelocation?: boolean;
  strictChildren?: boolean;
  strictEducation?: boolean;
  strictHeight?: boolean;
  strictIncome?: boolean;
  strictLocation?: boolean;

  // Explicit opt-in cultural/community filters (consent-based only, not default)
  religionAccepted?: string[];
  strictReligion?: boolean;
  casteAccepted?: string[];
  strictCaste?: boolean;
  casteNoBar?: boolean;

  [key: string]: any;
}

export interface CandidateProfile {
  _id?: any;
  profileId?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  dob?: Date | string;
  ageYears?: number;
  maritalStatus?: MaritalStatus;
  heightCm?: number;

  city?: string;
  state?: string;
  country?: string;
  nativePlace?: string;

  education?: Education;
  educationField?: string;
  undergraduateCollege?: string;
  degree?: string;

  annualIncomeINR?: number;
  occupation?: string;
  designation?: string;
  company?: string;
  careerGoals?: string;

  childrenPreference?: string;
  relocationPreference?: string;
  petPreference?: string;

  diet?: Diet;
  smoking?: HabitLevel;
  drinking?: HabitLevel;
  hobbies?: string[];
  lifestylePreferences?: string;
  familyValues?: string;

  religion?: string;
  caste?: string;
  motherTongue?: string;
  languages?: string[];

  preferences?: CustomerPartnerPreferences;
  selfDescription?: string;
  relationshipExpectations?: string;
  avatarSeed?: string;
  verificationStatus?: string;

  [key: string]: any;
}

export interface MatchWeights {
  mutualAge: number;
  children: number;
  relocation: number;
  career: number;
  education: number;
  lifestyle: number;
  height: number;
  income: number;
  // Opt-in cultural weights (strictly 0 by default)
  religion?: number;
  caste?: number;
}

export interface DimensionScore {
  score: number; // 0 to maxScore
  maxScore: number;
  percentage: number; // 0 to 100
  detail: string;
}

export interface MatchExplanation {
  summary: string;
  positiveSignals: string[];
  mismatches: string[];
  missingInformation: string[];
}

export interface MatchResult {
  candidateId: string;
  candidate: CandidateProfile;
  score: number; // Normalized 0–100
  confidence: number; // 0–100 (penalized for missing information)
  dimensions: {
    mutualAge: DimensionScore;
    children: DimensionScore;
    relocation: DimensionScore;
    career: DimensionScore;
    education: DimensionScore;
    lifestyle: DimensionScore;
    height?: DimensionScore;
    income?: DimensionScore;
    religion?: DimensionScore;
    caste?: DimensionScore;
    [key: string]: DimensionScore | undefined;
  };
  explanation: MatchExplanation;
  matchedCriteria: string[];
  potentialConcerns: string[];
}

export interface MatchOptions {
  weights?: Partial<MatchWeights>;
  presetName?: string;
  rejectedCandidateIds?: (string | any)[];
  limit?: number;
  minScore?: number;
  includeExplanations?: boolean;
}
