import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { createApp } from '../src/app';
import { User } from '../src/models/User.model';
import { Customer } from '../src/models/Customer.model';
import { setOpenAIClient, getOpenAIClient, countWords } from '../src/services/ai.service';
import { config } from '../src/config/env';

const app = createApp();

let authToken: string;
let clientCustomer: any;
let candidateCustomer: any;

describe('AI Match Introduction Feature Tests (POST /api/ai/match-introduction)', () => {
  beforeAll(async () => {
    const testUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/date_crew_test_db';
    try {
      await mongoose.connect(testUri);
    } catch {
      // Handled if already connected or in-memory
    }

    // Clear and create test user
    await User.deleteMany({});
    await Customer.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Test@1234', salt);
    await User.create({
      fullName: 'Test Matchmaker',
      email: 'matchmaker.ai.test@datecrew.in',
      passwordHash,
      role: 'matchmaker',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'matchmaker.ai.test@datecrew.in',
      password: 'Test@1234',
    });
    authToken = loginRes.body.token;

    // Create client customer with private contact & sensitive fields
    clientCustomer = await Customer.create({
      profileId: 'DC-AI-CLIENT-001',
      isClient: true,
      firstName: 'Ananya',
      lastName: 'Sharma',
      fullName: 'Ananya Sharma',
      email: 'ananya.private@datecrew.in', // Sensitive/Private
      phone: '+91-98765-43210', // Sensitive/Private
      gender: 'female',
      dob: new Date('1997-03-20'),
      maritalStatus: 'never_married',
      heightCm: 165,
      city: 'Bengaluru',
      state: 'Karnataka',
      religion: 'Hindu', // Sensitive
      caste: 'Brahmin', // Sensitive
      motherTongue: 'Hindi',
      avatarSeed: 'test-seed-ananya',
      diet: 'vegetarian',
      education: 'Masters',
      educationField: 'Computer Science',
      occupation: 'Software Engineer',
      annualIncomeINR: 3200000,
      hobbies: ['Reading', 'Hiking'],
      lifestylePreferences: 'Health-conscious, Weekend traveler',
      familyValues: 'moderate',
      verificationStatus: 'trust_badge',
      journeyStatus: 'active',
      preferences: {
        ageMin: 27,
        ageMax: 33,
        heightMinCm: 170,
        heightMaxCm: 190,
        religionAccepted: ['Hindu'],
        casteNoBar: true,
        educationMin: 'Bachelors',
        incomeMinINR: 2000000,
        locationPreference: ['Bengaluru'],
        diet: ['vegetarian'],
        maritalStatusAccepted: ['never_married'],
        flexibilityScore: 0.8,
      },
    });

    // Create candidate customer with private contact & sensitive fields
    candidateCustomer = await Customer.create({
      profileId: 'DC-AI-CAND-002',
      isClient: false,
      firstName: 'Vikram',
      lastName: 'Iyer',
      fullName: 'Vikram Iyer',
      email: 'vikram.private@datecrew.in', // Sensitive/Private
      phone: '+91-98765-12345', // Sensitive/Private
      gender: 'male',
      dob: new Date('1995-08-10'),
      maritalStatus: 'never_married',
      heightCm: 178,
      city: 'Bengaluru',
      state: 'Karnataka',
      religion: 'Hindu', // Sensitive
      caste: 'Iyer', // Sensitive
      motherTongue: 'Tamil',
      avatarSeed: 'test-seed-vikram',
      diet: 'vegetarian',
      education: 'Bachelors',
      educationField: 'Information Technology',
      occupation: 'Product Manager',
      annualIncomeINR: 3500000,
      hobbies: ['Reading', 'Badminton'], // Note: 'Reading' is shared
      lifestylePreferences: 'Fitness enthusiast',
      familyValues: 'moderate',
      verificationStatus: 'phone_verified',
      preferences: {
        ageMin: 24,
        ageMax: 30,
        heightMinCm: 155,
        heightMaxCm: 175,
        religionAccepted: ['Hindu'],
        casteNoBar: true,
        educationMin: 'Bachelors',
        incomeMinINR: 1500000,
        locationPreference: ['Bengaluru'],
        diet: ['vegetarian'],
        maritalStatusAccepted: ['never_married'],
        flexibilityScore: 0.7,
      },
    });
  });

  afterEach(() => {
    // Reset any custom mocked client
    setOpenAIClient(null);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('1. Authentication & Security Authorization', () => {
    it('rejects unauthenticated requests without Bearer token with 401', async () => {
      const res = await request(app).post('/api/ai/match-introduction').send({
        customerId: clientCustomer._id,
        candidateId: candidateCustomer._id,
      });
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Authentication required/i);
    });

    it('never exposes OPENAI_API_KEY in API responses', async () => {
      const secretKey = 'sk-proj-super-secret-matchmaker-key-9999';
      const originalKey = config.openaiApiKey;
      config.openaiApiKey = secretKey;

      try {
        const res = await request(app)
          .post('/api/ai/match-introduction')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerId: clientCustomer._id,
            candidateId: candidateCustomer._id,
          });

        expect(res.status).toBe(200);
        const jsonString = JSON.stringify(res.body);
        expect(jsonString).not.toContain(secretKey);
        expect(res.body.apiKey).toBeUndefined();
        expect(res.body.openaiApiKey).toBeUndefined();
      } finally {
        config.openaiApiKey = originalKey;
      }
    });
  });

  describe('2. Request Validation & Invalid IDs', () => {
    it('returns 400 when customerId or candidateId is missing', async () => {
      const res = await request(app)
        .post('/api/ai/match-introduction')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ candidateId: candidateCustomer._id });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Both customerId.*and candidateId are required/i);
    });

    it('returns 400 for malformed ObjectId values', async () => {
      const res = await request(app)
        .post('/api/ai/match-introduction')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: 'invalid-id-123',
          candidateId: candidateCustomer._id,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid ID format/i);
    });

    it('returns 400 when customerId and candidateId are identical', async () => {
      const res = await request(app)
        .post('/api/ai/match-introduction')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: clientCustomer._id,
          candidateId: clientCustomer._id,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot be identical/i);
    });

    it('returns 404 when customer profile does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/ai/match-introduction')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: nonExistentId,
          candidateId: candidateCustomer._id,
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Customer profile not found/i);
    });

    it('returns 404 when candidate profile does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/ai/match-introduction')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: clientCustomer._id,
          candidateId: nonExistentId,
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Candidate profile not found/i);
    });
  });

  describe('3. Successful Generation with Mocked AI Client (Responses API)', () => {
    it('successfully generates personalized introduction using mocked OpenAI client', async () => {
      const mockAiOutput =
        'Dear Ananya, we are delighted to present Vikram, an accomplished Product Manager based in Bengaluru. Our compatibility engine noted an impressive 88% alignment across your preferences, especially within educational background in technology and aligned urban lifestyles. Both profiles highlight a shared passion for reading alongside dedication to career growth. We believe your complementary perspectives offer an inspiring basis for an initial conversation. Warm regards, The Date Crew.';

      let recordedCallParams: any = null;

      const mockOpenAIClient: any = {
        responses: {
          create: jest.fn().mockImplementation(async (params: any) => {
            recordedCallParams = params;
            return {
              output_text: mockAiOutput,
              output: [
                {
                  type: 'message',
                  content: [{ type: 'output_text', text: mockAiOutput }],
                },
              ],
            };
          }),
        },
      };

      setOpenAIClient(mockOpenAIClient);
      const originalApiKey = config.openaiApiKey;
      config.openaiApiKey = 'test-mock-key';

      try {
        const res = await request(app)
          .post('/api/ai/match-introduction')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerId: clientCustomer._id,
            candidateId: candidateCustomer._id,
            score: { total: 88, dimensions: { lifestyleHarmony: 15, educationAlignment: 12 } },
            explanation: {
              summary: 'Strong synergy in education, profession and city.',
              positiveSignals: ['Both in Bengaluru tech sector', 'Shared passion for reading'],
            },
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.source).toBe('ai');
        expect(res.body.introduction).toBe(mockAiOutput);
        expect(res.body.wordCount).toBe(countWords(mockAiOutput));
        expect(res.body.wordCount).toBeGreaterThanOrEqual(60);
        expect(res.body.wordCount).toBeLessThanOrEqual(100);

        // Verify Responses API was called with the configured model
        expect(mockOpenAIClient.responses.create).toHaveBeenCalledTimes(1);
        expect(recordedCallParams.model).toBe(config.openaiModel);

        // Verify minimum data requirement & absence of sensitive information in prompt
        const inputString = recordedCallParams.input;
        expect(inputString).toContain('Ananya');
        expect(inputString).toContain('Vikram');
        expect(inputString).toContain('Bengaluru');
        expect(inputString).toContain('Software Engineer');
        // Critical: sensitive contact details, caste, religion must NOT be sent to LLM
        expect(inputString).not.toContain(clientCustomer.email);
        expect(inputString).not.toContain(clientCustomer.phone);
        expect(inputString).not.toContain('Brahmin');
        expect(inputString).not.toContain('Iyer');
        expect(inputString).not.toContain('Hindu');

        // Verify instructions enforce non-predictive relationship phrasing and boundary
        expect(recordedCallParams.instructions).toContain('writing assistant');
        expect(recordedCallParams.instructions).toContain('NEVER describe the compatibility score as a forecast, guarantee, or prediction of relationship success');
      } finally {
        config.openaiApiKey = originalApiKey;
      }
    });
  });

  describe('4. Missing API Configuration Fallback', () => {
    it('returns high-quality curated fallback when OPENAI_API_KEY is not configured', async () => {
      const originalKey = config.openaiApiKey;
      config.openaiApiKey = '';
      setOpenAIClient(null);

      try {
        const res = await request(app)
          .post('/api/ai/match-introduction')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerId: clientCustomer._id,
            candidateId: candidateCustomer._id,
            score: 86,
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.source).toBe('fallback');
        expect(res.body.fallbackReason).toBe('missing_api_key');
        expect(res.body.introduction).toBeDefined();

        // Check word count bounds (60-100 words)
        const wordCount = res.body.wordCount;
        expect(wordCount).toBeGreaterThanOrEqual(60);
        expect(wordCount).toBeLessThanOrEqual(100);

        // Verify only verified present facts are used
        expect(res.body.introduction).toContain('Ananya');
        expect(res.body.introduction).toContain('Vikram');
        expect(res.body.introduction).toContain('Product Manager');
        expect(res.body.introduction).toContain('Bengaluru');
        // Verify shared hobby (Reading) is recognized
        expect(res.body.introduction.toLowerCase()).toContain('reading');

        // Verify sensitive fields are not included
        expect(res.body.introduction).not.toContain('Hindu');
        expect(res.body.introduction).not.toContain('Brahmin');
        expect(res.body.introduction).not.toContain('Iyer');
        expect(res.body.introduction).not.toContain(clientCustomer.email);
        expect(res.body.introduction).not.toContain(clientCustomer.phone);

        // Verify non-predictive phrasing
        expect(res.body.introduction).not.toMatch(/guarantee.*marriage|predict.*success/i);
      } finally {
        config.openaiApiKey = originalKey;
      }
    });
  });

  describe('5. API Failure, Rate Limits & Timeout Fallback Handling', () => {
    it('handles rate limit error (429) gracefully and returns fallback with rate_limited reason', async () => {
      const rateLimitError: any = new Error('Rate limit exceeded');
      rateLimitError.status = 429;
      rateLimitError.name = 'RateLimitError';

      const mockFailingClient: any = {
        responses: {
          create: jest.fn().mockRejectedValue(rateLimitError),
        },
      };

      setOpenAIClient(mockFailingClient);
      const originalApiKey = config.openaiApiKey;
      config.openaiApiKey = 'test-mock-key';

      try {
        const res = await request(app)
          .post('/api/ai/match-introduction')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerId: clientCustomer._id,
            candidateId: candidateCustomer._id,
            score: 82,
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.source).toBe('fallback');
        expect(res.body.fallbackReason).toBe('rate_limited');
        expect(res.body.introduction).toBeDefined();
        expect(res.body.wordCount).toBeGreaterThanOrEqual(60);
        expect(res.body.wordCount).toBeLessThanOrEqual(100);
      } finally {
        config.openaiApiKey = originalApiKey;
      }
    });

    it('handles timeout error gracefully and returns fallback with timeout reason', async () => {
      const timeoutError: any = new Error('Connection timed out');
      timeoutError.name = 'APIConnectionTimeoutError';

      const mockTimeoutClient: any = {
        responses: {
          create: jest.fn().mockRejectedValue(timeoutError),
        },
      };

      setOpenAIClient(mockTimeoutClient);
      const originalApiKey = config.openaiApiKey;
      config.openaiApiKey = 'test-mock-key';

      try {
        const res = await request(app)
          .post('/api/ai/match-introduction')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerId: clientCustomer._id,
            candidateId: candidateCustomer._id,
            score: 84,
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.source).toBe('fallback');
        expect(res.body.fallbackReason).toBe('timeout');
        expect(res.body.introduction).toBeDefined();
      } finally {
        config.openaiApiKey = originalApiKey;
      }
    });

    it('handles generic API service failure without throwing 500 error to user', async () => {
      const genericError = new Error('500 Internal Server Error from upstream OpenAI');

      const mockFailingClient: any = {
        responses: {
          create: jest.fn().mockRejectedValue(genericError),
        },
      };

      setOpenAIClient(mockFailingClient);
      const originalApiKey = config.openaiApiKey;
      config.openaiApiKey = 'test-mock-key';

      try {
        const res = await request(app)
          .post('/api/ai/match-introduction')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerId: clientCustomer._id,
            candidateId: candidateCustomer._id,
            score: 80,
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.source).toBe('fallback');
        expect(res.body.fallbackReason).toBe('api_error');
        expect(res.body.introduction).toBeDefined();
      } finally {
        config.openaiApiKey = originalApiKey;
      }
    });
  });

  describe('6. Match Proposal Dispatch with Custom/Edited Introduction', () => {
    it('saves custom/edited introduction draft when confirming match send', async () => {
      const customIntroText =
        'Dear Ananya, we have customized this introduction specifically following our consultation call. Vikram has an aligned vision in technology and family outlook.';

      const res = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientCustomer._id,
          candidateId: candidateCustomer._id,
          customIntroduction: customIntroText,
          notes: 'Edited draft by matchmaker',
        });

      expect(res.status).toBe(201);
      expect(res.body.aiIntroduction).toBe(customIntroText);
      expect(res.body.emailDelivered).toBe(true);
    });
  });
});
