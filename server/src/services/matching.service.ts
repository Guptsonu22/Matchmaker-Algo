import { ICustomer } from '../models/Customer.model.js';
import { IScoreSnapshot, IScoreDimensions } from '../models/MatchEvent.model.js';
export * from './matchmaking/index.js';

const EDUCATION_RANKS: Record<string, number> = {
  HSC: 1,
  Diploma: 2,
  Bachelors: 3,
  Masters: 4,
  PhD: 5,
  Other: 2,
};

export function calculateAge(dob: Date): number {
  const diffMs = Date.now() - new Date(dob).getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

export function computeMatchingScore(
  client: ICustomer,
  candidate: ICustomer
): IScoreSnapshot {
  const cPrefs = client.preferences;
  const candAge = calculateAge(candidate.dob);

  // 1. Age Compatibility (Max: 15)
  let ageScore = 0;
  if (candAge >= cPrefs.ageMin && candAge <= cPrefs.ageMax) {
    ageScore = 15;
  } else {
    const diff = Math.min(
      Math.abs(candAge - cPrefs.ageMin),
      Math.abs(candAge - cPrefs.ageMax)
    );
    ageScore = Math.max(0, 15 - diff * 3);
  }

  // 2. Location Match (Max: 10)
  let locationScore = 1; // Base score for country
  if (candidate.city.toLowerCase() === client.city.toLowerCase()) {
    locationScore = 10;
  } else if (candidate.state.toLowerCase() === client.state.toLowerCase()) {
    locationScore = 7;
  } else if (
    cPrefs.locationPreference &&
    cPrefs.locationPreference.some((loc) =>
      candidate.city.toLowerCase().includes(loc.toLowerCase())
    )
  ) {
    locationScore = 9;
  } else if (candidate.country.toLowerCase() === client.country.toLowerCase()) {
    locationScore = 4;
  }

  // 3. Cultural Fit (Max: 20)
  // Religion: 10, Caste: 5, Mother tongue: 5
  let culturalScore = 0;
  const religionMatches =
    candidate.religion === client.religion ||
    (cPrefs.religionAccepted && cPrefs.religionAccepted.includes(candidate.religion));
  if (religionMatches) culturalScore += 10;

  if (cPrefs.casteNoBar) {
    culturalScore += 5;
  } else if (candidate.caste && client.caste && candidate.caste.toLowerCase() === client.caste.toLowerCase()) {
    culturalScore += 5;
  }

  if (
    candidate.motherTongue &&
    client.motherTongue &&
    candidate.motherTongue.toLowerCase() === client.motherTongue.toLowerCase()
  ) {
    culturalScore += 5;
  }

  // 4. Education Alignment (Max: 12)
  let educationScore = 0;
  const candEduRank = EDUCATION_RANKS[candidate.education] || 2;
  const prefEduRank = EDUCATION_RANKS[cPrefs.educationMin] || 3;
  if (candEduRank >= prefEduRank) {
    educationScore = 12;
  } else if (candEduRank === prefEduRank - 1) {
    educationScore = 6;
  } else {
    educationScore = 2;
  }

  // 5. Income Alignment (Max: 13)
  let incomeScore = 0;
  if (!cPrefs.incomeMinINR || cPrefs.incomeMinINR === 0) {
    incomeScore = 13;
  } else if (candidate.annualIncomeINR >= cPrefs.incomeMinINR) {
    incomeScore = 13;
  } else {
    const ratio = candidate.annualIncomeINR / cPrefs.incomeMinINR;
    incomeScore = Math.max(0, Math.round(ratio * 13));
  }

  // 6. Lifestyle Harmony (Max: 15)
  // Diet: 6, Smoking/Drinking: 5, Hobbies overlap: 4
  let lifestyleScore = 0;
  if (
    candidate.diet === client.diet ||
    (cPrefs.diet && cPrefs.diet.includes(candidate.diet))
  ) {
    lifestyleScore += 6;
  } else {
    lifestyleScore += 2;
  }

  // Habits
  let habitPoints = 5;
  if (candidate.smoking === 'yes') habitPoints -= 2;
  if (candidate.drinking === 'yes') habitPoints -= 1;
  lifestyleScore += Math.max(0, habitPoints);

  // Shared hobbies (up to 4)
  const sharedHobbies = (candidate.hobbies || []).filter((h) =>
    (client.hobbies || []).includes(h)
  );
  lifestyleScore += Math.min(4, sharedHobbies.length * 2);

  // 7. Preference Reciprocity (Max: 15)
  // Check how well the client satisfies the candidate's preferences
  let reciprocityScore = 0;
  const candPrefs = candidate.preferences;
  const clientAge = calculateAge(client.dob);

  if (candPrefs) {
    let recSubScore = 0;
    // Age match
    if (clientAge >= candPrefs.ageMin && clientAge <= candPrefs.ageMax) {
      recSubScore += 5;
    } else {
      recSubScore += 2;
    }
    // Religion / Diet
    if (candPrefs.religionAccepted && candPrefs.religionAccepted.includes(client.religion)) {
      recSubScore += 5;
    } else if (candidate.religion === client.religion) {
      recSubScore += 5;
    }
    // Income / Education
    if (
      !candPrefs.incomeMinINR ||
      client.annualIncomeINR >= candPrefs.incomeMinINR
    ) {
      recSubScore += 5;
    }
    reciprocityScore = recSubScore;
  } else {
    reciprocityScore = 10;
  }

  const dimensions: IScoreDimensions = {
    ageCompatibility: Math.min(15, ageScore),
    locationMatch: Math.min(10, locationScore),
    educationAlignment: Math.min(12, educationScore),
    incomeAlignment: Math.min(13, incomeScore),
    lifestyleHarmony: Math.min(15, lifestyleScore),
    culturalFit: Math.min(20, culturalScore),
    preferenceReciprocity: Math.min(15, reciprocityScore),
  };

  const total =
    dimensions.ageCompatibility +
    dimensions.locationMatch +
    dimensions.educationAlignment +
    dimensions.incomeAlignment +
    dimensions.lifestyleHarmony +
    dimensions.culturalFit +
    dimensions.preferenceReciprocity;

  return {
    total: Math.min(100, Math.max(0, total)),
    dimensions,
  };
}
