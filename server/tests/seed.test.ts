import mongoose from 'mongoose';
import { Customer } from '../src/models/Customer.model';
import { MatchPreference } from '../src/models/MatchPreference.model';
import { seedDeterministicCandidates } from '../src/seed/seedCandidatesDeterministic';
import { calculateAge } from '../src/services/matching.service';

describe('Deterministic Candidates Seed & Schema Verification', () => {
  beforeAll(async () => {
    const testUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/date_crew_test_db';
    try {
      await mongoose.connect(testUri);
      await Customer.deleteMany({});
      await MatchPreference.deleteMany({});
    } catch (err) {
      console.warn('MongoDB connection unavailable in test runner, skipping DB setup.');
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('runs deterministic seed and produces exactly 120 fictional candidate profiles', async () => {
    const seedResult = await seedDeterministicCandidates();

    expect(seedResult.insertedCount).toBe(120);
    expect(seedResult.totalCandidates).toBe(120);
    expect(seedResult.totalPreferences).toBe(120);

    const candidates = await Customer.find({});
    expect(candidates.length).toBe(120);

    // Verify Gender balance: 60 males, 60 females
    const maleCount = candidates.filter((c) => c.gender === 'male').length;
    const femaleCount = candidates.filter((c) => c.gender === 'female').length;
    expect(maleCount).toBe(60);
    expect(femaleCount).toBe(60);

    // Verify all candidates are adults (21–45)
    candidates.forEach((c) => {
      const age = calculateAge(c.dob);
      expect(age).toBeGreaterThanOrEqual(21);
      expect(age).toBeLessThanOrEqual(45);

      // Verify required biodata fields are populated
      expect(c.firstName).toBeTruthy();
      expect(c.lastName).toBeTruthy();
      expect(c.fullName).toBeTruthy();
      expect(c.gender).toMatch(/male|female/);
      expect(c.dob).toBeInstanceOf(Date);
      expect(c.country).toBe('India');
      expect(c.city).toBeTruthy();
      expect(c.heightCm).toBeGreaterThan(140);
      expect(c.email).toMatch(/@fictional-demo-datecrew\.in$/); // Fictional email domain
      expect(c.phone).toMatch(/^\+91-98000-/); // Fictional phone series
      expect(c.undergraduateCollege).toBeTruthy();
      expect(c.degree).toBeTruthy();
      expect(c.annualIncomeINR).toBeGreaterThan(0);
      expect(c.company).toBeTruthy();
      expect(c.designation).toBeTruthy();
      expect(c.maritalStatus).toBeTruthy();
      expect(c.languages.length).toBeGreaterThan(0);
      expect(c.siblings).toBeTruthy();
      expect(c.caste).toBeDefined();
      expect(c.religion).toBeTruthy();
      expect(c.childrenPreference).toBeTruthy();
      expect(c.relocationPreference).toBeTruthy();
      expect(c.petPreference).toBeTruthy();

      // Verify optional/extended fields
      expect(c.hobbies.length).toBeGreaterThan(0);
      expect(c.profileCompleteness).toBeGreaterThanOrEqual(90);

      // Verify safety: marked synthetic and never verified
      expect(c.isSynthetic).toBe(true);
      expect(c.verificationStatus).toMatch(/unverified|pending/);
    });

    // Verify separate MatchPreference collection records
    const preferences = await MatchPreference.find({});
    expect(preferences.length).toBe(120);
    preferences.forEach((pref) => {
      expect(pref.candidateId).toBeDefined();
      expect(pref.ageMin).toBeGreaterThanOrEqual(21);
      expect(pref.ageMax).toBeLessThanOrEqual(45);
      expect(pref.preferredCities.length).toBeGreaterThan(0);
    });
  });

  it('proves idempotency: rerunning seed does not create duplicate records', async () => {
    // Run second time
    const rerunResult = await seedDeterministicCandidates();

    expect(rerunResult.insertedCount).toBe(120);
    expect(rerunResult.totalCandidates).toBe(120); // Count should remain 120, not 240
    expect(rerunResult.totalPreferences).toBe(120);

    const countInDb = await Customer.countDocuments();
    expect(countInDb).toBe(120);
  });
});
