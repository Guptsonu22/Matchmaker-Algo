import {
  CandidateProfile,
  CustomerPartnerPreferences,
  DimensionScore,
  MatchExplanation,
  MatchOptions,
  MatchResult,
  MatchWeights,
} from './types.js';
import { DEFAULT_MATCH_WEIGHTS, getPresetWeights } from './presets.js';

const EDUCATION_RANKS: Record<string, number> = {
  hsc: 1,
  diploma: 2,
  bachelors: 3,
  masters: 4,
  phd: 5,
  doctorate: 5,
  other: 2,
};

export function calculateAgeFromDate(dob?: Date | string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const diffMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function getCandidateAge(candidate: CandidateProfile): number | null {
  if (typeof candidate.ageYears === 'number' && candidate.ageYears > 0) {
    return candidate.ageYears;
  }
  return calculateAgeFromDate(candidate.dob);
}

function normalizeChildrenPreference(pref?: string): 'wants' | 'does_not_want' | 'flexible' | 'missing' {
  if (!pref || typeof pref !== 'string') return 'missing';
  const lower = pref.toLowerCase();
  if (
    lower.includes('no children') ||
    lower.includes('does_not_want') ||
    lower.includes('childfree') ||
    lower.includes('not want') ||
    lower === 'no'
  ) {
    return 'does_not_want';
  }
  if (
    lower.includes('open') ||
    lower.includes('flexible') ||
    lower.includes('discussion') ||
    lower.includes('not sure') ||
    lower.includes('undecided')
  ) {
    return 'flexible';
  }
  if (
    lower.includes('want') ||
    lower.includes('yes') ||
    lower.includes('future') ||
    lower.includes('children')
  ) {
    return 'wants';
  }
  return 'flexible';
}

function normalizeRelocation(pref?: string): 'willing' | 'not_willing' | 'conditional' | 'missing' {
  if (!pref || typeof pref !== 'string') return 'missing';
  const lower = pref.toLowerCase();
  if (
    lower.includes('not willing') ||
    lower.includes('not_willing') ||
    lower.includes('unwilling') ||
    lower.includes('cannot relocate') ||
    lower.includes('permanent') ||
    lower.includes('prefers staying') ||
    lower === 'no'
  ) {
    return 'not_willing';
  }
  if (
    lower.includes('open to relocating') ||
    lower.includes('open_to_relocating') ||
    lower.includes('willing') ||
    lower.includes('flexible') ||
    lower.includes('globally') ||
    lower.includes('internationally') ||
    lower.includes('anywhere')
  ) {
    return 'willing';
  }
  if (lower.includes('right career') || lower.includes('open to discussion') || lower.includes('mutual')) {
    return 'conditional';
  }
  return 'conditional';
}

function formatINR(val?: number): string {
  if (!val || val <= 0) return 'Not disclosed';
  return `₹${(val / 100000).toFixed(1)} Lakhs`;
}

/**
 * Pure matchmaking function.
 * Evaluates a candidate pool against customer profile and preferences.
 */
export function matchCandidates(
  customer: CandidateProfile,
  preferences: CustomerPartnerPreferences,
  candidates: CandidateProfile[],
  options?: MatchOptions
): MatchResult[] {
  if (!candidates || candidates.length === 0) {
    return [];
  }

  // 1. Resolve configuration and weights
  const baseWeights: MatchWeights = options?.presetName
    ? getPresetWeights(options.presetName)
    : { ...DEFAULT_MATCH_WEIGHTS, ...(options?.weights || {}) };

  const customerId = String(customer._id || customer.profileId || '');
  const rejectedSet = new Set(
    (options?.rejectedCandidateIds || []).map((id) => String(id))
  );

  // Determine target gender: explicit partner preference > opposite customer gender > null
  const targetGender =
    preferences.targetGender ||
    (customer.gender === 'male'
      ? 'female'
      : customer.gender === 'female'
      ? 'male'
      : undefined);

  const customerAge = getCandidateAge(customer);

  // 2. Filter exclusions and hard constraints
  const seenIds = new Set<string>();
  const compatibleCandidates: { candidate: CandidateProfile; id: string }[] = [];

  for (const cand of candidates) {
    const candId = String(cand._id || cand.profileId || '');
    if (!candId) continue;

    // Exclude customer self
    if (customerId && (candId === customerId || cand.profileId === customer.profileId)) {
      continue;
    }

    // Exclude duplicates
    if (seenIds.has(candId)) {
      continue;
    }
    seenIds.add(candId);

    // Exclude rejected matches
    if (rejectedSet.has(candId) || (cand.profileId && rejectedSet.has(cand.profileId))) {
      continue;
    }

    // Exclude incompatible genders according to stated preference
    if (targetGender && cand.gender && cand.gender.toLowerCase() !== targetGender.toLowerCase()) {
      continue;
    }

    // ── Hard Constraints (Applied ONLY when explicitly specified) ──
    const candAge = getCandidateAge(cand);

    // Hard Constraint: Age range
    if (preferences.strictAge) {
      if (candAge === null) continue; // Cannot verify strict hard constraint
      if (typeof preferences.ageMin === 'number' && candAge < preferences.ageMin) continue;
      if (typeof preferences.ageMax === 'number' && candAge > preferences.ageMax) continue;
    }

    // Hard Constraint: Marital status
    if (preferences.strictMaritalStatus && preferences.maritalStatusAccepted && preferences.maritalStatusAccepted.length > 0) {
      if (!cand.maritalStatus || !preferences.maritalStatusAccepted.includes(cand.maritalStatus)) {
        continue;
      }
    }

    // Hard Constraint: Relocation requirement
    if (preferences.strictRelocation) {
      const sameCity =
        cand.city &&
        customer.city &&
        cand.city.trim().toLowerCase() === customer.city.trim().toLowerCase();
      const candReloc = normalizeRelocation(cand.relocationPreference);
      if (!sameCity && candReloc === 'not_willing') {
        continue;
      }
    }

    // Hard Constraint: Children requirement
    if (preferences.strictChildren) {
      const custChildren = normalizeChildrenPreference(
        preferences.childrenPreferenceAccepted?.[0] || customer.childrenPreference
      );
      const candChildren = normalizeChildrenPreference(cand.childrenPreference);
      if (
        (custChildren === 'wants' && candChildren === 'does_not_want') ||
        (custChildren === 'does_not_want' && candChildren === 'wants')
      ) {
        continue;
      }
    }

    // Hard Constraint: Education requirement
    if (preferences.strictEducation && preferences.educationMin) {
      const minRank = EDUCATION_RANKS[preferences.educationMin.toLowerCase()] || 2;
      const candRank = cand.education ? EDUCATION_RANKS[cand.education.toLowerCase()] || 2 : 0;
      if (candRank < minRank) {
        continue;
      }
    }

    // Hard Constraint: Height requirement
    if (preferences.strictHeight) {
      if (typeof cand.heightCm !== 'number') continue;
      if (typeof preferences.heightMinCm === 'number' && cand.heightCm < preferences.heightMinCm) continue;
      if (typeof preferences.heightMaxCm === 'number' && cand.heightCm > preferences.heightMaxCm) continue;
    }

    // Hard Constraint: Income requirement
    if (preferences.strictIncome && typeof preferences.incomeMinINR === 'number' && preferences.incomeMinINR > 0) {
      if (typeof cand.annualIncomeINR !== 'number' || cand.annualIncomeINR < preferences.incomeMinINR) {
        continue;
      }
    }

    // Hard Constraint: Optional explicit religion consent filter
    if (preferences.strictReligion && preferences.religionAccepted && preferences.religionAccepted.length > 0) {
      if (!cand.religion || !preferences.religionAccepted.includes(cand.religion)) {
        continue;
      }
    }

    compatibleCandidates.push({ candidate: cand, id: candId });
  }

  // 3. Score and evaluate each candidate
  const results: MatchResult[] = compatibleCandidates.map(({ candidate, id }) => {
    let confidence = 100;
    const positiveSignals: string[] = [];
    const mismatches: string[] = [];
    const missingInformation: string[] = [];
    const matchedCriteria: string[] = [];
    const potentialConcerns: string[] = [];

    const candAge = getCandidateAge(candidate);

    // ── Dimension 1: Mutual Age Compatibility ──
    let ageScore = 0.5;
    let ageDetail = '';
    if (candAge === null) {
      confidence -= 15;
      missingInformation.push('Candidate date of birth or age is missing.');
      ageDetail = 'Age unverified; neutral default applied.';
    } else {
      const minA = typeof preferences.ageMin === 'number' ? preferences.ageMin : 21;
      const maxA = typeof preferences.ageMax === 'number' ? preferences.ageMax : 45;

      // Customer -> Candidate
      let forwardAge = 1.0;
      if (candAge >= minA && candAge <= maxA) {
        forwardAge = 1.0;
        positiveSignals.push(`Candidate age ${candAge} is within preferred range (${minA}–${maxA}).`);
        matchedCriteria.push('Age Range Compatibility');
      } else {
        const diff = Math.min(Math.abs(candAge - minA), Math.abs(candAge - maxA));
        forwardAge = Math.max(0, 1 - diff * 0.18);
        mismatches.push(`Candidate age ${candAge} deviates from preferred range (${minA}–${maxA}) by ${diff} year(s).`);
        potentialConcerns.push(`Age variance: ${candAge} yrs (target: ${minA}–${maxA})`);
      }

      // Candidate -> Customer (Reciprocity)
      let reverseAge = 0.85;
      const candPrefs = candidate.preferences;
      if (customerAge !== null && candPrefs && (candPrefs.ageMin || candPrefs.ageMax)) {
        const cMin = candPrefs.ageMin ?? 21;
        const cMax = candPrefs.ageMax ?? 45;
        if (customerAge >= cMin && customerAge <= cMax) {
          reverseAge = 1.0;
          positiveSignals.push(`Customer age ${customerAge} fulfills candidate's mutual expectation (${cMin}–${cMax}).`);
        } else {
          const diff = Math.min(Math.abs(customerAge - cMin), Math.abs(customerAge - cMax));
          reverseAge = Math.max(0, 1 - diff * 0.2);
          mismatches.push(`Customer age ${customerAge} is outside candidate's age range (${cMin}–${cMax}).`);
        }
      } else if (!candPrefs?.ageMin && !candPrefs?.ageMax) {
        // Candidate has no strict age restriction specified
        reverseAge = 0.9;
      }

      ageScore = forwardAge * 0.6 + reverseAge * 0.4;
      ageDetail = `Candidate age: ${candAge} yrs, forward alignment: ${(forwardAge * 100).toFixed(0)}%, mutual reciprocity: ${(reverseAge * 100).toFixed(0)}%`;
    }

    // ── Dimension 2: Children and Family-Planning Preferences ──
    let childrenScore = 0.5;
    let childrenDetail = '';
    const custChildNorm = normalizeChildrenPreference(
      preferences.childrenPreferenceAccepted?.[0] || customer.childrenPreference
    );
    const candChildNorm = normalizeChildrenPreference(candidate.childrenPreference);

    if (candChildNorm === 'missing') {
      confidence -= 12;
      missingInformation.push('Candidate children and family-planning preference is unspecified.');
      childrenScore = 0.5;
      childrenDetail = 'Unspecified in profile; evaluated neutrally.';
    } else {
      if (custChildNorm === 'missing') {
        childrenScore = 0.75;
        childrenDetail = `Candidate indicates: "${candidate.childrenPreference}". Customer preference not explicitly stated.`;
      } else if (custChildNorm === candChildNorm && custChildNorm !== 'flexible') {
        childrenScore = 1.0;
        positiveSignals.push(`Mutual alignment on family planning: both indicate ${custChildNorm === 'wants' ? 'wanting children' : 'remaining childfree'}.`);
        matchedCriteria.push('Children & Family Planning Outlook');
        childrenDetail = `Exact mutual match on children outlook: "${candidate.childrenPreference}".`;
      } else if (custChildNorm === 'flexible' || candChildNorm === 'flexible') {
        childrenScore = 0.8;
        positiveSignals.push(`Flexible approach to family planning (${candidate.childrenPreference || 'open'}).`);
        matchedCriteria.push('Flexible Family Planning');
        childrenDetail = `Open/flexible family planning dialogue: "${candidate.childrenPreference}".`;
      } else {
        // Direct conflict (one wants, one does not want)
        childrenScore = 0.0;
        mismatches.push(`Conflicting family planning goals: customer indicates ${custChildNorm}, candidate indicates ${candChildNorm} ("${candidate.childrenPreference}").`);
        potentialConcerns.push('Divergent family planning / children goals');
        childrenDetail = `Direct mismatch: customer (${custChildNorm}) vs candidate (${candChildNorm}).`;
      }
    }

    // ── Dimension 3: Relocation and Preferred Locations ──
    let relocationScore = 0.5;
    let relocationDetail = '';
    const candRelocNorm = normalizeRelocation(candidate.relocationPreference);
    const sameCity =
      Boolean(candidate.city && customer.city && candidate.city.trim().toLowerCase() === customer.city.trim().toLowerCase());
    const sameState =
      Boolean(candidate.state && customer.state && candidate.state.trim().toLowerCase() === customer.state.trim().toLowerCase());

    const cityMatchPreferred = Boolean(
      candidate.city &&
        (preferences.preferredCities || preferences.locationPreference || []).some(
          (loc) => loc.toLowerCase().includes(candidate.city!.toLowerCase()) || candidate.city!.toLowerCase().includes(loc.toLowerCase())
        )
    );

    if (!candidate.city) {
      confidence -= 10;
      missingInformation.push('Candidate primary city location is unspecified.');
    }
    if (candRelocNorm === 'missing') {
      confidence -= 8;
      missingInformation.push('Candidate relocation preference is unspecified.');
    }

    if (sameCity) {
      relocationScore = 1.0;
      positiveSignals.push(`Both residing in the same city (${candidate.city}).`);
      matchedCriteria.push('Local City Proximity');
      relocationDetail = `Resides in same city: ${candidate.city}.`;
    } else if (cityMatchPreferred) {
      relocationScore = 0.95;
      positiveSignals.push(`Candidate is in ${candidate.city}, matching customer's preferred locations.`);
      matchedCriteria.push('Preferred City Match');
      relocationDetail = `Candidate city (${candidate.city}) matches customer preferred list.`;
    } else if (sameState) {
      if (candRelocNorm === 'willing' || candRelocNorm === 'conditional') {
        relocationScore = 0.85;
        positiveSignals.push(`Same state (${candidate.state}) with openness to relocation ("${candidate.relocationPreference}").`);
      } else {
        relocationScore = 0.75;
      }
      matchedCriteria.push('Regional / State Match');
      relocationDetail = `Same state (${candidate.state}); relocation: ${candidate.relocationPreference || 'unspecified'}.`;
    } else {
      if (candRelocNorm === 'willing') {
        relocationScore = 0.75;
        positiveSignals.push(`Candidate is willing to relocate: "${candidate.relocationPreference}".`);
        relocationDetail = `Different city (${candidate.city}), but candidate is open to relocation.`;
      } else if (candRelocNorm === 'conditional') {
        relocationScore = 0.6;
        relocationDetail = `Different city (${candidate.city}); relocation is conditional: "${candidate.relocationPreference}".`;
      } else if (candRelocNorm === 'not_willing') {
        relocationScore = 0.2;
        mismatches.push(`Geographical distance: Candidate based in ${candidate.city || 'other city'} and prefers staying locally.`);
        potentialConcerns.push(`Geographical mismatch: Candidate prefers not relocating from ${candidate.city}.`);
        relocationDetail = `Different city (${candidate.city}) with reluctance to relocate.`;
      } else {
        relocationScore = 0.5;
        relocationDetail = `Different city (${candidate.city || 'unspecified'}); relocation policy unknown.`;
      }
    }

    // ── Dimension 4: Career and Professional Compatibility ──
    let careerScore = 0.5;
    let careerDetail = '';
    if (!candidate.occupation) {
      confidence -= 10;
      missingInformation.push('Candidate occupation is not specified.');
      careerDetail = 'Occupation unspecified.';
    } else {
      positiveSignals.push(`Professional profile: ${candidate.occupation}${candidate.company ? ` at ${candidate.company}` : ''}.`);
      matchedCriteria.push('Professional Employment');

      // Check for mutual career aspiration synergy
      if (candidate.careerGoals && customer.careerGoals) {
        careerScore = 0.95;
        positiveSignals.push(`Both have clearly articulated long-term career roadmaps.`);
        careerDetail = `${candidate.occupation} (${candidate.designation || 'Specialist'}) with active career vision.`;
      } else if (candidate.careerGoals || customer.careerGoals) {
        careerScore = 0.85;
        careerDetail = `${candidate.occupation} with ambitious career milestones.`;
      } else {
        careerScore = 0.75;
        careerDetail = `Established professional: ${candidate.occupation}.`;
      }
    }

    // ── Dimension 5: Education Preferences ──
    let educationScore = 0.5;
    let educationDetail = '';
    if (!candidate.education) {
      confidence -= 10;
      missingInformation.push('Candidate education level is not specified.');
      educationDetail = 'Education unverified; evaluated neutrally.';
    } else {
      const minEdu = preferences.educationMin || 'Bachelors';
      const minRank = EDUCATION_RANKS[minEdu.toLowerCase()] || 3;
      const candRank = EDUCATION_RANKS[candidate.education.toLowerCase()] || 2;

      if (candRank >= minRank) {
        educationScore = 1.0;
        positiveSignals.push(`Education meets/exceeds preference: ${candidate.education}${candidate.educationField ? ` in ${candidate.educationField}` : ''}.`);
        matchedCriteria.push('Education Qualification');
        educationDetail = `${candidate.education} (Rank ${candRank} >= Required ${minRank}).`;
      } else if (candRank === minRank - 1) {
        educationScore = 0.6;
        mismatches.push(`Candidate holds ${candidate.education}, one tier below preferred ${minEdu}.`);
        educationDetail = `${candidate.education} is slightly below preferred ${minEdu}.`;
      } else {
        educationScore = 0.25;
        mismatches.push(`Candidate education (${candidate.education}) is below preferred ${minEdu}.`);
        potentialConcerns.push(`Educational gap: ${candidate.education} vs requested ${minEdu}`);
        educationDetail = `${candidate.education} below preferred minimum ${minEdu}.`;
      }
    }

    // ── Dimension 6: Lifestyle, Hobbies, and Shared Values ──
    let lifestyleScore = 0.5;
    let lifestyleDetail = '';
    let subLifestyle = 0;
    let lifestyleWeightsTotal = 0;

    // Diet
    if (candidate.diet) {
      lifestyleWeightsTotal += 0.4;
      const acceptedDiets = preferences.diet || (customer.diet ? [customer.diet] : []);
      if (acceptedDiets.length === 0 || acceptedDiets.includes(candidate.diet) || candidate.diet === customer.diet) {
        subLifestyle += 0.4;
        positiveSignals.push(`Dietary alignment: ${candidate.diet}.`);
        matchedCriteria.push('Dietary Alignment');
      } else {
        subLifestyle += 0.16;
        mismatches.push(`Dietary difference: candidate is ${candidate.diet}, customer preferred ${acceptedDiets.join(', ')}.`);
        potentialConcerns.push(`Dietary difference (${candidate.diet})`);
      }
    } else {
      confidence -= 6;
      missingInformation.push('Candidate dietary preference is unspecified.');
    }

    // Habits (Smoking / Drinking)
    lifestyleWeightsTotal += 0.3;
    let habitScore = 0.3;
    if (candidate.smoking === 'yes') {
      habitScore -= 0.15;
      mismatches.push('Candidate smokes regularly.');
      potentialConcerns.push('Smoking habit');
    }
    if (candidate.drinking === 'yes') {
      habitScore -= 0.05;
    }
    subLifestyle += Math.max(0, habitScore);

    // Hobbies Overlap
    lifestyleWeightsTotal += 0.3;
    const candHobbies = Array.isArray(candidate.hobbies) ? candidate.hobbies : [];
    const custHobbies = Array.isArray(customer.hobbies) ? customer.hobbies : [];

    if (candHobbies.length === 0) {
      confidence -= 4;
      missingInformation.push('Candidate hobbies are unspecified.');
      subLifestyle += 0.12;
    } else {
      const sharedHobbies = candHobbies.filter((h) =>
        custHobbies.some((ch) => ch.toLowerCase() === h.toLowerCase())
      );
      if (sharedHobbies.length > 0) {
        subLifestyle += Math.min(0.3, 0.15 + sharedHobbies.length * 0.08);
        positiveSignals.push(`Shared hobbies and interests: ${sharedHobbies.join(', ')}.`);
        matchedCriteria.push('Shared Hobbies');
      } else {
        subLifestyle += 0.15;
      }
    }

    lifestyleScore = lifestyleWeightsTotal > 0 ? subLifestyle / lifestyleWeightsTotal : 0.6;
    lifestyleDetail = `Lifestyle score: ${(lifestyleScore * 100).toFixed(0)}% (diet, habits, hobbies).`;

    // ── Dimension 7: Height Preferences (When Specified) ──
    let heightScore: number | undefined = undefined;
    let heightDetail: string | undefined = undefined;
    const hasHeightPref =
      typeof preferences.heightMinCm === 'number' || typeof preferences.heightMaxCm === 'number';

    if (hasHeightPref) {
      if (typeof candidate.heightCm !== 'number') {
        confidence -= 8;
        missingInformation.push('Candidate height is unspecified.');
        heightScore = 0.5;
        heightDetail = 'Height not disclosed in profile.';
      } else {
        const hMin = preferences.heightMinCm ?? 140;
        const hMax = preferences.heightMaxCm ?? 210;
        if (candidate.heightCm >= hMin && candidate.heightCm <= hMax) {
          heightScore = 1.0;
          positiveSignals.push(`Height of ${candidate.heightCm} cm matches preference (${hMin}–${hMax} cm).`);
          matchedCriteria.push('Height Compatibility');
          heightDetail = `${candidate.heightCm} cm is within preferred ${hMin}–${hMax} cm.`;
        } else {
          const diff = Math.min(Math.abs(candidate.heightCm - hMin), Math.abs(candidate.heightCm - hMax));
          heightScore = Math.max(0, 1 - diff * 0.1);
          mismatches.push(`Height of ${candidate.heightCm} cm deviates from preferred range (${hMin}–${hMax} cm).`);
          potentialConcerns.push(`Height variance: ${candidate.heightCm} cm`);
          heightDetail = `${candidate.heightCm} cm outside ${hMin}–${hMax} cm by ${diff} cm.`;
        }
      }
    }

    // ── Dimension 8: Income Preferences (When Specified) ──
    let incomeScore: number | undefined = undefined;
    let incomeDetail: string | undefined = undefined;
    const hasIncomePref =
      typeof preferences.incomeMinINR === 'number' && preferences.incomeMinINR > 0;

    if (hasIncomePref) {
      if (typeof candidate.annualIncomeINR !== 'number') {
        confidence -= 8;
        missingInformation.push('Candidate annual income is unspecified.');
        incomeScore = 0.5;
        incomeDetail = 'Income not disclosed in profile.';
      } else {
        const reqIncome = preferences.incomeMinINR!;
        if (candidate.annualIncomeINR >= reqIncome) {
          incomeScore = 1.0;
          positiveSignals.push(`Annual income of ${formatINR(candidate.annualIncomeINR)} fulfills preferred minimum of ${formatINR(reqIncome)}.`);
          matchedCriteria.push('Income Alignment');
          incomeDetail = `${formatINR(candidate.annualIncomeINR)} meets requested minimum.`;
        } else {
          const ratio = candidate.annualIncomeINR / reqIncome;
          incomeScore = Math.max(0, Math.min(1.0, ratio));
          mismatches.push(`Income of ${formatINR(candidate.annualIncomeINR)} is below preferred minimum of ${formatINR(reqIncome)}.`);
          potentialConcerns.push(`Income below target (${formatINR(candidate.annualIncomeINR)} vs ${formatINR(reqIncome)})`);
          incomeDetail = `${formatINR(candidate.annualIncomeINR)} is ${(ratio * 100).toFixed(0)}% of target minimum.`;
        }
      }
    }

    // ── Optional: Consent-based Cultural Filter / Scoring (Strictly 0 by default) ──
    let religionScore: number | undefined = undefined;
    let religionDetail: string | undefined = undefined;
    if (baseWeights.religion && baseWeights.religion > 0) {
      if (preferences.religionAccepted && preferences.religionAccepted.length > 0) {
        if (candidate.religion && preferences.religionAccepted.includes(candidate.religion)) {
          religionScore = 1.0;
          religionDetail = `Religion matches consent-based preference: ${candidate.religion}.`;
        } else {
          religionScore = 0.0;
          religionDetail = `Religion ${candidate.religion || 'unspecified'} not in consented preference.`;
        }
      } else {
        religionScore = 1.0;
        religionDetail = 'No explicit religious preference declared.';
      }
    }

    // ── 4. Calculate Final Normalized Score (0 to 100) ──
    const activeWeights: { key: string; score: number; weight: number }[] = [
      { key: 'mutualAge', score: ageScore, weight: baseWeights.mutualAge },
      { key: 'children', score: childrenScore, weight: baseWeights.children },
      { key: 'relocation', score: relocationScore, weight: baseWeights.relocation },
      { key: 'career', score: careerScore, weight: baseWeights.career },
      { key: 'education', score: educationScore, weight: baseWeights.education },
      { key: 'lifestyle', score: lifestyleScore, weight: baseWeights.lifestyle },
    ];

    if (hasHeightPref && heightScore !== undefined) {
      activeWeights.push({ key: 'height', score: heightScore, weight: baseWeights.height });
    }
    if (hasIncomePref && incomeScore !== undefined) {
      activeWeights.push({ key: 'income', score: incomeScore, weight: baseWeights.income });
    }
    if (religionScore !== undefined && baseWeights.religion && baseWeights.religion > 0) {
      activeWeights.push({ key: 'religion', score: religionScore, weight: baseWeights.religion });
    }

    const totalWeightSum = activeWeights.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = activeWeights.reduce((sum, item) => sum + item.score * item.weight, 0);

    const rawNormalized = totalWeightSum > 0 ? (weightedSum / totalWeightSum) * 100 : 0;
    const finalScore = Math.min(100, Math.max(0, Math.round(rawNormalized * 10) / 10));

    // Clamp confidence between 20 and 100
    const finalConfidence = Math.max(20, Math.min(100, confidence));

    // Summary generator
    let summary = `Candidate achieves ${finalScore}% overall compatibility with ${finalConfidence}% profile data confidence.`;
    if (positiveSignals.length > 0) {
      summary += ` Key drivers include ${positiveSignals.slice(0, 2).join(' and ')}.`;
    }
    if (potentialConcerns.length > 0) {
      summary += ` Considerations: ${potentialConcerns.slice(0, 2).join('; ')}.`;
    }

    const dimensions: MatchResult['dimensions'] = {
      mutualAge: {
        score: Math.round(ageScore * baseWeights.mutualAge * 10) / 10,
        maxScore: baseWeights.mutualAge,
        percentage: Math.round(ageScore * 100),
        detail: ageDetail,
      },
      children: {
        score: Math.round(childrenScore * baseWeights.children * 10) / 10,
        maxScore: baseWeights.children,
        percentage: Math.round(childrenScore * 100),
        detail: childrenDetail,
      },
      relocation: {
        score: Math.round(relocationScore * baseWeights.relocation * 10) / 10,
        maxScore: baseWeights.relocation,
        percentage: Math.round(relocationScore * 100),
        detail: relocationDetail,
      },
      career: {
        score: Math.round(careerScore * baseWeights.career * 10) / 10,
        maxScore: baseWeights.career,
        percentage: Math.round(careerScore * 100),
        detail: careerDetail,
      },
      education: {
        score: Math.round(educationScore * baseWeights.education * 10) / 10,
        maxScore: baseWeights.education,
        percentage: Math.round(educationScore * 100),
        detail: educationDetail,
      },
      lifestyle: {
        score: Math.round(lifestyleScore * baseWeights.lifestyle * 10) / 10,
        maxScore: baseWeights.lifestyle,
        percentage: Math.round(lifestyleScore * 100),
        detail: lifestyleDetail,
      },
    };

    if (heightScore !== undefined) {
      dimensions.height = {
        score: Math.round(heightScore * baseWeights.height * 10) / 10,
        maxScore: baseWeights.height,
        percentage: Math.round(heightScore * 100),
        detail: heightDetail || '',
      };
    }

    if (incomeScore !== undefined) {
      dimensions.income = {
        score: Math.round(incomeScore * baseWeights.income * 10) / 10,
        maxScore: baseWeights.income,
        percentage: Math.round(incomeScore * 100),
        detail: incomeDetail || '',
      };
    }

    if (religionScore !== undefined && baseWeights.religion && baseWeights.religion > 0) {
      dimensions.religion = {
        score: Math.round(religionScore * baseWeights.religion * 10) / 10,
        maxScore: baseWeights.religion,
        percentage: Math.round(religionScore * 100),
        detail: religionDetail || '',
      };
    }

    const explanation: MatchExplanation = {
      summary,
      positiveSignals,
      mismatches,
      missingInformation,
    };

    return {
      candidateId: id,
      candidate,
      score: finalScore,
      confidence: finalConfidence,
      dimensions,
      explanation,
      matchedCriteria,
      potentialConcerns,
    };
  });

  // 5. Deterministic sorting:
  // Primary: Score descending
  // Secondary: Confidence descending
  // Tertiary: Candidate ID / profileId string comparison (deterministic tiebreaking)
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    return a.candidateId.localeCompare(b.candidateId);
  });

  // Optional minimum score cutoff
  const filtered = typeof options?.minScore === 'number'
    ? results.filter((r) => r.score >= options.minScore!)
    : results;

  // Optional limit
  if (typeof options?.limit === 'number' && options.limit > 0) {
    return filtered.slice(0, options.limit);
  }

  return filtered;
}
