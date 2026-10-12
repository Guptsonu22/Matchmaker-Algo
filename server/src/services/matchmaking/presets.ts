import { MatchWeights, CustomerPartnerPreferences } from './types.js';

/**
 * Standard default weights emphasizing balanced personal, life-goal, and professional alignment.
 * Caste and religion weights are strictly 0 by default.
 */
export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  mutualAge: 18,
  children: 18,
  relocation: 16,
  career: 14,
  education: 14,
  lifestyle: 12,
  height: 4,
  income: 4,
  religion: 0,
  caste: 0,
};

export interface PreferencePreset {
  id: string;
  name: string;
  description: string;
  weights: MatchWeights;
  defaultPreferences?: Partial<CustomerPartnerPreferences>;
}

/**
 * Configurable preference presets.
 * Note: These presets demonstrate customizable strategic scenarios requested for operations review,
 * and are fully configurable starting points rather than rigid gender stereotypes.
 */
export const PREFERENCE_PRESETS: Record<string, PreferencePreset> = {
  balanced: {
    id: 'balanced',
    name: 'Egalitarian / Balanced Harmony',
    description: 'Equally balances mutual age, life planning, education, career, and lifestyle harmony.',
    weights: {
      mutualAge: 18,
      children: 18,
      relocation: 16,
      career: 14,
      education: 14,
      lifestyle: 12,
      height: 4,
      income: 4,
      religion: 0,
      caste: 0,
    },
  },

  careerFirst: {
    id: 'careerFirst',
    name: 'Career & Professional Focus',
    description: 'Emphasizes professional synergy, educational parity, and career mobility.',
    weights: {
      mutualAge: 12,
      children: 12,
      relocation: 16,
      career: 26,
      education: 20,
      lifestyle: 10,
      height: 2,
      income: 2,
      religion: 0,
      caste: 0,
    },
  },

  familyAndLifestyle: {
    id: 'familyAndLifestyle',
    name: 'Family Planning & Shared Values',
    description: 'Prioritizes mutual family planning, parenting outlook, and shared day-to-day lifestyle habits.',
    weights: {
      mutualAge: 15,
      children: 26,
      relocation: 15,
      career: 8,
      education: 10,
      lifestyle: 22,
      height: 2,
      income: 2,
      religion: 0,
      caste: 0,
    },
  },

  // Demonstration preset demonstrating traditional groom scenario requirements as a configurable preset
  traditionalGroomDemo: {
    id: 'traditionalGroomDemo',
    name: 'Traditional Groom Search Preset (Demonstration)',
    description: 'Configurable preset demonstrating traditional groom priorities: mutual age compatibility, shared family planning, and geographical stability.',
    weights: {
      mutualAge: 22,
      children: 22,
      relocation: 18,
      lifestyle: 16,
      education: 12,
      career: 6,
      height: 2,
      income: 2,
      religion: 0,
      caste: 0,
    },
    defaultPreferences: {
      strictRelocation: false,
    },
  },

  // Demonstration preset demonstrating traditional bride scenario requirements as a configurable preset
  traditionalBrideDemo: {
    id: 'traditionalBrideDemo',
    name: 'Traditional Bride Search Preset (Demonstration)',
    description: 'Configurable preset demonstrating traditional bride priorities: educational achievement, career stability, height preferences, and mutual location harmony.',
    weights: {
      mutualAge: 15,
      career: 20,
      education: 18,
      relocation: 15,
      children: 14,
      lifestyle: 8,
      height: 5,
      income: 5,
      religion: 0,
      caste: 0,
    },
    defaultPreferences: {
      heightMinCm: 168,
      strictHeight: false,
    },
  },
};

export function getPresetWeights(presetId?: string): MatchWeights {
  if (!presetId || !PREFERENCE_PRESETS[presetId]) {
    return { ...DEFAULT_MATCH_WEIGHTS };
  }
  return { ...PREFERENCE_PRESETS[presetId].weights };
}
