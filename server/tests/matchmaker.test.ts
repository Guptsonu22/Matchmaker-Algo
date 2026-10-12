import {
  matchCandidates,
  CustomerPartnerPreferences,
  CandidateProfile,
  PREFERENCE_PRESETS,
} from '../src/services/matchmaking/index.js';

describe('The Date Crew — Pure Matchmaking Service Unit Tests', () => {
  // Common sample profiles
  const sampleFemaleClient: CandidateProfile = {
    _id: 'client-female-01',
    profileId: 'DC-F-001',
    fullName: 'Ananya Sharma',
    gender: 'female',
    dob: new Date('1996-04-12'), // Age ~30
    maritalStatus: 'never_married',
    heightCm: 165,
    city: 'Mumbai',
    state: 'Maharashtra',
    education: 'Masters',
    educationField: 'Computer Science',
    occupation: 'Software Engineering Manager',
    company: 'Tech Corp',
    annualIncomeINR: 2800000,
    childrenPreference: 'Wants children in future',
    relocationPreference: 'Open to relocating within India',
    diet: 'vegetarian',
    smoking: 'no',
    drinking: 'occasionally',
    hobbies: ['Badminton', 'Trekking', 'Reading'],
    careerGoals: 'Lead global engineering teams and mentor women in tech.',
    religion: 'Hindu',
    caste: 'Brahmin',
    preferences: {
      ageMin: 28,
      ageMax: 35,
      educationMin: 'Bachelors',
      incomeMinINR: 2000000,
      locationPreference: ['Mumbai', 'Pune', 'Bengaluru'],
      preferredCities: ['Mumbai', 'Bengaluru'],
      diet: ['vegetarian'],
      maritalStatusAccepted: ['never_married'],
    },
  };

  const sampleMaleClient: CandidateProfile = {
    _id: 'client-male-01',
    profileId: 'DC-M-001',
    fullName: 'Rahul Deshmukh',
    gender: 'male',
    dob: new Date('1994-08-20'), // Age ~32
    maritalStatus: 'never_married',
    heightCm: 178,
    city: 'Bengaluru',
    state: 'Karnataka',
    education: 'Masters',
    educationField: 'Data Science',
    occupation: 'Lead AI Engineer',
    company: 'AI Labs',
    annualIncomeINR: 3500000,
    childrenPreference: 'Wants children in future',
    relocationPreference: 'Prefers staying in Bengaluru',
    diet: 'vegetarian',
    smoking: 'no',
    drinking: 'no',
    hobbies: ['Chess', 'Trekking', 'Classical Music'],
    careerGoals: 'Build ethical AI systems.',
    religion: 'Hindu',
    caste: 'Maratha',
    preferences: {
      ageMin: 26,
      ageMax: 32,
      educationMin: 'Bachelors',
      locationPreference: ['Bengaluru', 'Mumbai'],
      preferredCities: ['Bengaluru'],
      maritalStatusAccepted: ['never_married'],
    },
  };

  // 1. Strong Compatibility Test
  test('1. Strong compatibility: returns high score (>= 85) with high confidence and positive signals', () => {
    const preferences: CustomerPartnerPreferences = {
      targetGender: 'male',
      ageMin: 28,
      ageMax: 34,
      educationMin: 'Bachelors',
      preferredCities: ['Mumbai'],
      diet: ['vegetarian'],
      heightMinCm: 170,
      heightMaxCm: 185,
      incomeMinINR: 2500000,
    };

    const idealCandidate: CandidateProfile = {
      _id: 'cand-strong-01',
      profileId: 'DC-M-IDEAL',
      fullName: 'Aarav Mehta',
      gender: 'male',
      dob: new Date('1995-02-10'), // Age ~31
      maritalStatus: 'never_married',
      heightCm: 178,
      city: 'Mumbai',
      state: 'Maharashtra',
      education: 'Masters',
      educationField: 'Computer Science',
      occupation: 'Senior Staff Engineer',
      company: 'Google',
      annualIncomeINR: 3800000,
      childrenPreference: 'Wants children in future',
      relocationPreference: 'Open to relocating within India or Singapore',
      diet: 'vegetarian',
      smoking: 'no',
      drinking: 'no',
      hobbies: ['Badminton', 'Trekking', 'Guitar'],
      careerGoals: 'Aspiring to lead core distributed systems.',
      preferences: {
        ageMin: 26,
        ageMax: 32,
      },
    };

    const results = matchCandidates(sampleFemaleClient, preferences, [idealCandidate]);

    expect(results).toHaveLength(1);
    const match = results[0];
    expect(match.score).toBeGreaterThanOrEqual(85);
    expect(match.confidence).toBeGreaterThanOrEqual(95);
    expect(match.explanation.positiveSignals.length).toBeGreaterThan(3);
    expect(match.explanation.mismatches).toHaveLength(0);
    expect(match.matchedCriteria).toContain('Age Range Compatibility');
    expect(match.matchedCriteria).toContain('Children & Family Planning Outlook');
    expect(match.matchedCriteria).toContain('Local City Proximity');
  });

  // 2. Incompatible Hard Constraints Test
  test('2. Incompatible hard constraints: excludes candidates violating strict rules', () => {
    const preferences: CustomerPartnerPreferences = {
      targetGender: 'male',
      ageMin: 28,
      ageMax: 32,
      strictAge: true,
      maritalStatusAccepted: ['never_married'],
      strictMaritalStatus: true,
      strictRelocation: true,
      strictChildren: true,
      strictEducation: true,
      educationMin: 'Masters',
      childrenPreferenceAccepted: ['wants'],
    };

    const candViolatingAge: CandidateProfile = {
      _id: 'cand-bad-age',
      profileId: 'DC-M-OLD',
      fullName: 'Dev Old',
      gender: 'male',
      dob: new Date('1985-01-01'), // Age ~41, exceeds ageMax (32)
      maritalStatus: 'never_married',
      city: 'Mumbai',
      education: 'Masters',
      childrenPreference: 'wants',
      relocationPreference: 'willing',
    };

    const candViolatingMarital: CandidateProfile = {
      _id: 'cand-bad-marital',
      profileId: 'DC-M-DIV',
      fullName: 'Vikram Divorced',
      gender: 'male',
      dob: new Date('1995-01-01'),
      maritalStatus: 'divorced', // Violates never_married
      city: 'Mumbai',
      education: 'Masters',
      childrenPreference: 'wants',
      relocationPreference: 'willing',
    };

    const candViolatingRelocation: CandidateProfile = {
      _id: 'cand-bad-reloc',
      profileId: 'DC-M-STAY',
      fullName: 'Ramesh Stationary',
      gender: 'male',
      dob: new Date('1995-01-01'),
      maritalStatus: 'never_married',
      city: 'Delhi', // Different city
      education: 'Masters',
      childrenPreference: 'wants',
      relocationPreference: 'not_willing', // Reluctance to relocate
    };

    const candViolatingChildren: CandidateProfile = {
      _id: 'cand-bad-child',
      profileId: 'DC-M-NOKIDS',
      fullName: 'Suresh Childfree',
      gender: 'male',
      dob: new Date('1995-01-01'),
      maritalStatus: 'never_married',
      city: 'Mumbai',
      education: 'Masters',
      childrenPreference: 'does_not_want_children', // Conflicts with wants
      relocationPreference: 'willing',
    };

    const candViolatingEducation: CandidateProfile = {
      _id: 'cand-bad-edu',
      profileId: 'DC-M-HSC',
      fullName: 'Kunal HSC',
      gender: 'male',
      dob: new Date('1995-01-01'),
      maritalStatus: 'never_married',
      city: 'Mumbai',
      education: 'HSC', // Below Masters
      childrenPreference: 'wants',
      relocationPreference: 'willing',
    };

    const validCandidate: CandidateProfile = {
      _id: 'cand-valid',
      profileId: 'DC-M-VALID',
      fullName: 'Valid Candidate',
      gender: 'male',
      dob: new Date('1995-01-01'),
      maritalStatus: 'never_married',
      city: 'Mumbai',
      education: 'Masters',
      childrenPreference: 'wants',
      relocationPreference: 'willing',
    };

    const results = matchCandidates(sampleFemaleClient, preferences, [
      candViolatingAge,
      candViolatingMarital,
      candViolatingRelocation,
      candViolatingChildren,
      candViolatingEducation,
      validCandidate,
    ]);

    // Only the valid candidate survives hard constraints
    expect(results).toHaveLength(1);
    expect(results[0].candidateId).toBe('cand-valid');
  });

  // 3. Different Children Preferences Test
  test('3. Different children preferences: records zero children score and concern when not strictly filtered', () => {
    const preferences: CustomerPartnerPreferences = {
      targetGender: 'male',
      strictChildren: false, // Non-strict; evaluate compatibility score
      childrenPreferenceAccepted: ['wants'],
    };

    const childfreeCandidate: CandidateProfile = {
      _id: 'cand-childfree',
      profileId: 'DC-M-CF',
      fullName: 'Kabir Childfree',
      gender: 'male',
      dob: new Date('1994-01-01'),
      city: 'Mumbai',
      education: 'Masters',
      childrenPreference: 'does_not_want_children', // Incompatible
    };

    const flexibleCandidate: CandidateProfile = {
      _id: 'cand-flexible',
      profileId: 'DC-M-FLEX',
      fullName: 'Sameer Open',
      gender: 'male',
      dob: new Date('1994-01-01'),
      city: 'Mumbai',
      education: 'Masters',
      childrenPreference: 'open to discussion with partner', // Flexible
    };

    const results = matchCandidates(sampleFemaleClient, preferences, [
      childfreeCandidate,
      flexibleCandidate,
    ]);

    expect(results).toHaveLength(2);
    const cfMatch = results.find((r) => r.candidateId === 'cand-childfree')!;
    const flexMatch = results.find((r) => r.candidateId === 'cand-flexible')!;

    // Childfree candidate has 0 children dimension score and flagged concern
    expect(cfMatch.dimensions.children.score).toBe(0);
    expect(cfMatch.potentialConcerns).toContain('Divergent family planning / children goals');
    expect(cfMatch.explanation.mismatches.some((m) => m.includes('family planning'))).toBe(true);

    // Flexible candidate receives a favorable flexible score
    expect(flexMatch.dimensions.children.score).toBeGreaterThan(0);
    expect(flexMatch.score).toBeGreaterThan(cfMatch.score);
  });

  // 4. Relocation Compatibility Test
  test('4. Relocation compatibility: distinguishes same city vs relocation willingness vs unwilling', () => {
    const preferences: CustomerPartnerPreferences = {
      targetGender: 'male',
      strictRelocation: false,
      preferredCities: ['Mumbai'],
    };

    const sameCityCand: CandidateProfile = {
      _id: 'cand-loc-same',
      profileId: 'DC-M-SAME',
      fullName: 'Local Mumbai',
      gender: 'male',
      dob: new Date('1995-01-01'),
      city: 'Mumbai',
      relocationPreference: 'prefers staying in Mumbai',
    };

    const diffCityWilling: CandidateProfile = {
      _id: 'cand-loc-willing',
      profileId: 'DC-M-WILLING',
      fullName: 'Bengaluru Willing',
      gender: 'male',
      dob: new Date('1995-01-01'),
      city: 'Bengaluru',
      relocationPreference: 'Open to relocating anywhere in India',
    };

    const diffCityUnwilling: CandidateProfile = {
      _id: 'cand-loc-unwilling',
      profileId: 'DC-M-UNWILLING',
      fullName: 'Delhi Unwilling',
      gender: 'male',
      dob: new Date('1995-01-01'),
      city: 'Delhi',
      relocationPreference: 'not willing to relocate',
    };

    const results = matchCandidates(sampleFemaleClient, preferences, [
      sameCityCand,
      diffCityWilling,
      diffCityUnwilling,
    ]);

    expect(results).toHaveLength(3);
    const sameMatch = results.find((r) => r.candidateId === 'cand-loc-same')!;
    const willingMatch = results.find((r) => r.candidateId === 'cand-loc-willing')!;
    const unwillingMatch = results.find((r) => r.candidateId === 'cand-loc-unwilling')!;

    expect(sameMatch.dimensions.relocation.score).toBeGreaterThan(willingMatch.dimensions.relocation.score);
    expect(willingMatch.dimensions.relocation.score).toBeGreaterThan(unwillingMatch.dimensions.relocation.score);
    expect(unwillingMatch.potentialConcerns.some((c) => c.includes('Geographical'))).toBe(true);
  });

  // 5. Missing Data Penalty Test
  test('5. Missing data: penalizes confidence without automatic rejection and reports missing fields', () => {
    const preferences: CustomerPartnerPreferences = {
      targetGender: 'male',
      heightMinCm: 175,
      incomeMinINR: 2000000,
    };

    const barebonesCandidate: CandidateProfile = {
      _id: 'cand-sparse',
      profileId: 'DC-M-SPARSE',
      fullName: 'Sparse Profile',
      gender: 'male',
      // dob is missing!
      // childrenPreference is missing!
      // relocationPreference is missing!
      // occupation is missing!
      // education is missing!
      // heightCm is missing!
      // annualIncomeINR is missing!
      city: 'Mumbai',
    };

    const results = matchCandidates(sampleFemaleClient, preferences, [barebonesCandidate]);

    expect(results).toHaveLength(1);
    const match = results[0];
    // Candidate was NOT rejected
    expect(match.candidateId).toBe('cand-sparse');
    // Confidence is severely reduced
    expect(match.confidence).toBeLessThanOrEqual(40);
    // Missing information is explicitly detailed
    expect(match.explanation.missingInformation.length).toBeGreaterThanOrEqual(4);
    expect(match.explanation.missingInformation.some((m) => m.includes('children'))).toBe(true);
    expect(match.explanation.missingInformation.some((m) => m.includes('occupation'))).toBe(true);
  });

  // 6. Both Directions of Gender Matching Test
  test('6. Both directions of gender matching: functions identically for male and female clients', () => {
    // A) Female client matching male candidates
    const femalePref: CustomerPartnerPreferences = {
      targetGender: 'male',
      ageMin: 28,
      ageMax: 35,
    };
    const maleCandidate: CandidateProfile = {
      _id: 'male-cand',
      profileId: 'DC-M-CAND',
      fullName: 'Viren Joshi',
      gender: 'male',
      dob: new Date('1994-01-01'),
      city: 'Mumbai',
      education: 'Bachelors',
    };
    const wrongGenderFemale: CandidateProfile = {
      _id: 'female-wrong',
      profileId: 'DC-F-WRONG',
      fullName: 'Wrong Gender Female',
      gender: 'female',
    };

    const femaleClientResults = matchCandidates(sampleFemaleClient, femalePref, [
      maleCandidate,
      wrongGenderFemale,
    ]);
    expect(femaleClientResults).toHaveLength(1);
    expect(femaleClientResults[0].candidateId).toBe('male-cand');

    // B) Male client matching female candidates
    const malePref: CustomerPartnerPreferences = {
      targetGender: 'female',
      ageMin: 25,
      ageMax: 32,
    };
    const femaleCandidate: CandidateProfile = {
      _id: 'female-cand',
      profileId: 'DC-F-CAND',
      fullName: 'Pooja Bhatt',
      gender: 'female',
      dob: new Date('1997-01-01'),
      city: 'Bengaluru',
      education: 'Masters',
    };
    const wrongGenderMale: CandidateProfile = {
      _id: 'male-wrong',
      profileId: 'DC-M-WRONG',
      fullName: 'Wrong Gender Male',
      gender: 'male',
    };

    const maleClientResults = matchCandidates(sampleMaleClient, malePref, [
      femaleCandidate,
      wrongGenderMale,
    ]);
    expect(maleClientResults).toHaveLength(1);
    expect(maleClientResults[0].candidateId).toBe('female-cand');
  });

  // 7. Equal-Score Candidates & Deterministic Tie-Breaking Test
  test('7. Equal-score candidates: produces deterministic tie-breaking based on profileId', () => {
    const preferences: CustomerPartnerPreferences = {
      targetGender: 'male',
    };

    // Create three identical candidates with different IDs
    const candA: CandidateProfile = {
      _id: 'id-alpha',
      profileId: 'DC-M-AAA',
      fullName: 'Candidate Alpha',
      gender: 'male',
      dob: new Date('1995-01-01'),
      city: 'Mumbai',
      education: 'Masters',
      childrenPreference: 'wants',
      relocationPreference: 'willing',
      diet: 'vegetarian',
    };

    const candB: CandidateProfile = {
      _id: 'id-beta',
      profileId: 'DC-M-BBB',
      fullName: 'Candidate Beta',
      gender: 'male',
      dob: new Date('1995-01-01'),
      city: 'Mumbai',
      education: 'Masters',
      childrenPreference: 'wants',
      relocationPreference: 'willing',
      diet: 'vegetarian',
    };

    const candC: CandidateProfile = {
      _id: 'id-gamma',
      profileId: 'DC-M-CCC',
      fullName: 'Candidate Gamma',
      gender: 'male',
      dob: new Date('1995-01-01'),
      city: 'Mumbai',
      education: 'Masters',
      childrenPreference: 'wants',
      relocationPreference: 'willing',
      diet: 'vegetarian',
    };

    // Run in arbitrary input order
    const results1 = matchCandidates(sampleFemaleClient, preferences, [candC, candA, candB]);
    const results2 = matchCandidates(sampleFemaleClient, preferences, [candB, candC, candA]);

    expect(results1[0].score).toBe(results1[1].score);
    expect(results1[1].score).toBe(results1[2].score);

    // Order should be identical and sorted deterministically by candidateId
    expect(results1.map((r) => r.candidateId)).toEqual(['id-alpha', 'id-beta', 'id-gamma']);
    expect(results2.map((r) => r.candidateId)).toEqual(['id-alpha', 'id-beta', 'id-gamma']);
  });

  // 8. Rejected Candidate and Self Exclusion Test
  test('8. Rejected candidate and self exclusion: excludes customer self, duplicates, and rejected IDs', () => {
    const preferences: CustomerPartnerPreferences = {
      targetGender: 'male',
    };

    const selfAsCandidate: CandidateProfile = {
      _id: sampleFemaleClient._id,
      profileId: sampleFemaleClient.profileId,
      fullName: sampleFemaleClient.fullName,
      gender: 'male', // even if gender was accidentally male
    };

    const rejectedCandidate: CandidateProfile = {
      _id: 'cand-rejected-99',
      profileId: 'DC-M-REJ',
      fullName: 'Rejected Candidate',
      gender: 'male',
      dob: new Date('1995-01-01'),
      city: 'Mumbai',
    };

    const allowedCandidate: CandidateProfile = {
      _id: 'cand-allowed-01',
      profileId: 'DC-M-ALLOWED',
      fullName: 'Allowed Candidate',
      gender: 'male',
      dob: new Date('1995-01-01'),
      city: 'Mumbai',
    };

    // Pool contains self, duplicate of allowed, rejected, and allowed
    const pool = [
      selfAsCandidate,
      allowedCandidate,
      rejectedCandidate,
      allowedCandidate, // duplicate!
    ];

    const results = matchCandidates(sampleFemaleClient, preferences, pool, {
      rejectedCandidateIds: ['cand-rejected-99'],
    });

    expect(results).toHaveLength(1);
    expect(results[0].candidateId).toBe('cand-allowed-01');
  });

  // 9. Empty Candidate Pool Test
  test('9. Empty candidate pool: gracefully returns an empty array', () => {
    const results = matchCandidates(sampleFemaleClient, {}, []);
    expect(results).toEqual([]);

    const resultsWithNull = matchCandidates(sampleFemaleClient, {}, null as any);
    expect(resultsWithNull).toEqual([]);
  });

  // 10. Score Boundaries & Normalization Test
  test('10. Score boundaries: scores are strictly clamped between 0 and 100 with configurable weights', () => {
    // Test custom weights that don't add up to 100 (e.g., 50 + 50 = 100 or 10 + 10 = 20)
    const customWeights = {
      mutualAge: 50,
      children: 50,
      relocation: 0,
      career: 0,
      education: 0,
      lifestyle: 0,
      height: 0,
      income: 0,
    };

    const perfectCandidate: CandidateProfile = {
      _id: 'cand-perfect',
      profileId: 'DC-M-PERF',
      fullName: 'Perfect Fit',
      gender: 'male',
      dob: new Date('1995-01-01'),
      childrenPreference: 'Wants children in future',
      city: 'Mumbai',
      preferences: {
        ageMin: 25,
        ageMax: 35,
      },
    };

    const terribleCandidate: CandidateProfile = {
      _id: 'cand-terrible',
      profileId: 'DC-M-TERR',
      fullName: 'Total Mismatch',
      gender: 'male',
      dob: new Date('1960-01-01'), // Age ~66, huge deviation
      childrenPreference: 'does_not_want_children', // Mismatch with wants
      city: 'London',
      relocationPreference: 'not_willing',
      smoking: 'yes',
      preferences: {
        ageMin: 55,
        ageMax: 65,
      },
    };

    const perfectResults = matchCandidates(
      sampleFemaleClient,
      {
        targetGender: 'male',
        ageMin: 28,
        ageMax: 34,
        childrenPreferenceAccepted: ['wants'],
      },
      [perfectCandidate],
      { weights: customWeights }
    );

    const terribleResults = matchCandidates(
      sampleFemaleClient,
      {
        targetGender: 'male',
        ageMin: 28,
        ageMax: 34,
        childrenPreferenceAccepted: ['wants'],
      },
      [terribleCandidate],
      { weights: customWeights }
    );

    expect(perfectResults[0].score).toBeLessThanOrEqual(100);
    expect(perfectResults[0].score).toBeGreaterThanOrEqual(95);

    expect(terribleResults[0].score).toBeGreaterThanOrEqual(0);
    expect(terribleResults[0].score).toBeLessThanOrEqual(10);
  });

  // 11. Configurable Preference Presets Test
  test('11. Presets: supports configurable presets like careerFirst and familyAndLifestyle', () => {
    const candidate: CandidateProfile = {
      _id: 'cand-preset-test',
      profileId: 'DC-M-PRESET',
      fullName: 'Tech Entrepreneur',
      gender: 'male',
      dob: new Date('1994-01-01'),
      city: 'Mumbai',
      education: 'PhD',
      occupation: 'AI Founder',
      careerGoals: 'Scaling deep tech venture',
      childrenPreference: 'open to discussion',
    };

    const balancedResult = matchCandidates(
      sampleFemaleClient,
      { targetGender: 'male' },
      [candidate],
      { presetName: 'balanced' }
    );

    const careerFirstResult = matchCandidates(
      sampleFemaleClient,
      { targetGender: 'male' },
      [candidate],
      { presetName: 'careerFirst' }
    );

    expect(PREFERENCE_PRESETS['careerFirst']).toBeDefined();
    expect(careerFirstResult[0].dimensions.career.maxScore).toBe(26);
    expect(balancedResult[0].dimensions.career.maxScore).toBe(14);
  });

  // 12. Religion and Caste Neutrality by Default Test
  test('12. Caste and religion neutrality: default weights exclude religion and caste from score', () => {
    const candidateA: CandidateProfile = {
      _id: 'cand-same-rel',
      profileId: 'DC-M-REL1',
      fullName: 'Same Community',
      gender: 'male',
      dob: new Date('1995-01-01'),
      city: 'Mumbai',
      religion: 'Hindu',
      caste: 'Brahmin',
    };

    const candidateB: CandidateProfile = {
      _id: 'cand-diff-rel',
      profileId: 'DC-M-REL2',
      fullName: 'Different Community',
      gender: 'male',
      dob: new Date('1995-01-01'),
      city: 'Mumbai',
      religion: 'Christian',
      caste: 'Anglo-Indian',
    };

    const results = matchCandidates(sampleFemaleClient, { targetGender: 'male' }, [
      candidateA,
      candidateB,
    ]);

    // Scores must be identical because default weights do not score religion/caste
    expect(results[0].score).toBe(results[1].score);
    expect(results[0].dimensions.religion).toBeUndefined();
    expect(results[0].dimensions.caste).toBeUndefined();
  });
});
