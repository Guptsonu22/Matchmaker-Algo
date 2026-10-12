import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { createApp } from '../src/app';
import { User } from '../src/models/User.model';
import { Customer } from '../src/models/Customer.model';
import { MatchmakerNote } from '../src/models/MatchmakerNote.model';
import { MatchEvent } from '../src/models/MatchEvent.model';

const app = createApp();

let authToken: string;
let testUser: any;
let clientCustomer: any;
let candidateCustomer: any;

beforeAll(async () => {
  // Use in-memory or local test database connection
  const testUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/date_crew_test_db';
  try {
    await mongoose.connect(testUri);
  } catch (err) {
    console.warn('Direct MongoDB connection failed in test runner, skipping DB setup if not available.');
  }

  // Clear test collections
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    MatchmakerNote.deleteMany({}),
    MatchEvent.deleteMany({}),
  ]);

  // Seed test matchmaker user
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Test@1234', salt);
  testUser = await User.create({
    fullName: 'Test Matchmaker',
    email: 'test@datecrew.in',
    passwordHash,
    role: 'matchmaker',
  });

  // Seed test client customer
  clientCustomer = await Customer.create({
    profileId: 'DC-TEST-001',
    isClient: true,
    firstName: 'Meera',
    lastName: 'Client',
    fullName: 'Meera Test Client',
    email: 'meera.test@datecrew.in',
    phone: '+91-98000-00001',
    gender: 'female',
    dob: new Date('1996-05-15'),
    maritalStatus: 'never_married',
    heightCm: 165,
    city: 'Mumbai',
    state: 'Maharashtra',
    religion: 'Hindu',
    caste: 'Brahmin',
    motherTongue: 'Marathi',
    isManglik: false,
    education: 'Masters',
    educationField: 'Finance',
    occupation: 'Investment Analyst',
    annualIncomeINR: 2000000,
    diet: 'vegetarian',
    smoking: 'no',
    drinking: 'no',
    hobbies: ['Classical Music', 'Badminton'],
    avatarSeed: 'test-seed-meera',
    photoVisibility: 'public',
    verificationStatus: 'trust_badge',
    journeyStatus: 'active',
    preferences: {
      ageMin: 28,
      ageMax: 35,
      heightMinCm: 172,
      heightMaxCm: 190,
      religionAccepted: ['Hindu'],
      casteNoBar: true,
      educationMin: 'Bachelors',
      incomeMinINR: 1500000,
      locationPreference: ['Mumbai'],
      diet: ['vegetarian', 'eggetarian'],
      maritalStatusAccepted: ['never_married'],
      flexibilityScore: 0.8,
    },
  });

  // Seed test candidate profile
  candidateCustomer = await Customer.create({
    profileId: 'DC-TEST-002',
    isClient: false,
    firstName: 'Rohan',
    lastName: 'Candidate',
    fullName: 'Rohan Test Candidate',
    email: 'rohan.test@datecrew.in',
    phone: '+91-98000-00002',
    gender: 'male',
    dob: new Date('1994-08-20'),
    maritalStatus: 'never_married',
    heightCm: 178,
    city: 'Mumbai',
    state: 'Maharashtra',
    religion: 'Hindu',
    caste: 'Brahmin',
    motherTongue: 'Marathi',
    isManglik: false,
    education: 'Masters',
    educationField: 'Computer Science',
    occupation: 'Software Architect',
    annualIncomeINR: 2800000,
    diet: 'vegetarian',
    smoking: 'no',
    drinking: 'no',
    hobbies: ['Classical Music', 'Trekking'],
    avatarSeed: 'test-seed-rohan',
    photoVisibility: 'public',
    verificationStatus: 'phone_verified',
    journeyStatus: 'new',
    preferences: {
      ageMin: 24,
      ageMax: 30,
      heightMinCm: 155,
      heightMaxCm: 175,
      religionAccepted: ['Hindu'],
      casteNoBar: true,
      educationMin: 'Bachelors',
      incomeMinINR: 1000000,
      locationPreference: ['Mumbai'],
      diet: ['vegetarian'],
      maritalStatusAccepted: ['never_married'],
      flexibilityScore: 0.7,
    },
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('1. Authentication & Security Flow', () => {
  it('rejects login with invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@datecrew.in',
      password: 'WrongPassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid email or password/i);
  });

  it('successfully logs in and returns a valid JWT token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@datecrew.in',
      password: 'Test@1234',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@datecrew.in');
    expect(res.body.user.passwordHash).toBeUndefined(); // Security: never expose hash
    authToken = res.body.token;
  });

  it('rejects access to protected routes without a token', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(401);
  });

  it('allows access to protected routes with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe('Test Matchmaker');
  });
});

describe('2. Customer Management & Validation Flow', () => {
  it('retrieves paginated customers list', async () => {
    const res = await request(app)
      .get('/api/customers?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].fullName).toBe('Meera Test Client');
  });

  it('retrieves single customer full biodata', async () => {
    const res = await request(app)
      .get(`/api/customers/${clientCustomer._id}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.profileId).toBe('DC-TEST-001');
    expect(res.body.preferences).toBeDefined();
    expect(res.body.preferences.ageMin).toBe(28);
  });

  it('validates malformed ObjectId parameters', async () => {
    const res = await request(app)
      .get('/api/customers/invalid-non-hex-id')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid identifier/i);
  });

  it('updates journey status with validation', async () => {
    const res = await request(app)
      .patch(`/api/customers/${clientCustomer._id}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ journeyStatus: 'matched' });
    expect(res.status).toBe(200);
    expect(res.body.journeyStatus).toBe('matched');
  });
});

describe('3. Matchmaker Notes CRUD Flow', () => {
  let createdNoteId: string;

  it('creates an internal operational note', async () => {
    const res = await request(app)
      .post(`/api/customers/${clientCustomer._id}/notes`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ note: 'Client family prefers meetings scheduled on Saturday afternoons.' });
    expect(res.status).toBe(201);
    expect(res.body.note).toContain('Saturday afternoons');
    expect(res.body.authorName).toBe('Test Matchmaker');
    createdNoteId = res.body._id;
  });

  it('lists notes for a customer', async () => {
    const res = await request(app)
      .get(`/api/customers/${clientCustomer._id}/notes`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('deletes an operational note', async () => {
    const res = await request(app)
      .delete(`/api/customers/${clientCustomer._id}/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });
});

describe('4. Matching Engine & Proposal Dispatch Flow', () => {
  it('generates ranked match recommendations with 7-dimension score breakdown', async () => {
    const res = await request(app)
      .get(`/api/customers/${clientCustomer._id}/matches`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    const firstMatch = res.body[0];
    expect(firstMatch.candidate).toBeDefined();
    expect(firstMatch.score).toBeDefined();
    expect(firstMatch.score.total).toBeGreaterThanOrEqual(50);
    expect(firstMatch.score.dimensions.culturalFit).toBeDefined();
    expect(firstMatch.score.dimensions.lifestyleHarmony).toBeDefined();
    expect(firstMatch.score.dimensions.preferenceReciprocity).toBeDefined();
  });

  it('dispatches a match proposal, creates intro text, and updates match history', async () => {
    const res = await request(app)
      .post('/api/matches/send')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientId: clientCustomer._id,
        candidateId: candidateCustomer._id,
        notes: 'Hand-picked by lead matchmaker.',
      });
    expect(res.status).toBe(201);
    expect(res.body.aiIntroduction).toBeDefined();
    expect(res.body.emailDelivered).toBe(true);
    expect(res.body.scoreSnapshot).toBeDefined();

    // Verify history retrieval
    const historyRes = await request(app)
      .get(`/api/matches/history/${clientCustomer._id}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.length).toBeGreaterThanOrEqual(1);
    expect(historyRes.body[0].aiIntroduction).toBeDefined();
  });
});
