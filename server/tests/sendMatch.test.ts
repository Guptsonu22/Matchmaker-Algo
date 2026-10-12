import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { createApp } from '../src/app';
import { User } from '../src/models/User.model';
import { Customer } from '../src/models/Customer.model';
import { MatchEvent } from '../src/models/MatchEvent.model';
import {
  setDeliveryAdapter,
  MockDeliveryAdapter,
  IDeliveryAdapter,
  DeliveryPayload,
  DeliveryReceipt,
} from '../src/services/delivery/delivery.adapter';

const app = createApp();

let authToken: string;
let clientCustomer: any;
let candidateCustomer1: any;
let candidateCustomer2: any;

describe('Send Match Workflow & Delivery Adapter Tests', () => {
  beforeAll(async () => {
    const testUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/date_crew_test_db';
    try {
      await mongoose.connect(testUri);
    } catch {
      // Handled if already connected or in-memory
    }

    await User.deleteMany({});
    await Customer.deleteMany({});
    await MatchEvent.deleteMany({});

    // Create test user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Test@1234', salt);
    await User.create({
      fullName: 'Senior Matchmaker Aarti',
      email: 'aarti.matchmaker@datecrew.in',
      passwordHash,
      role: 'senior_matchmaker',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'aarti.matchmaker@datecrew.in',
      password: 'Test@1234',
    });
    authToken = loginRes.body.token;

    // Create client
    clientCustomer = await Customer.create({
      profileId: 'DC-SEND-CL-01',
      isClient: true,
      firstName: 'Pooja',
      lastName: 'Deshmukh',
      fullName: 'Pooja Deshmukh',
      email: 'pooja.private@datecrew.in',
      phone: '+91-98111-22233',
      gender: 'female',
      dob: new Date('1996-04-12'),
      maritalStatus: 'never_married',
      heightCm: 163,
      city: 'Pune',
      state: 'Maharashtra',
      religion: 'Hindu',
      caste: 'Maratha',
      motherTongue: 'Marathi',
      avatarSeed: 'seed-pooja',
      diet: 'vegetarian',
      education: 'Masters',
      educationField: 'Biotechnology',
      occupation: 'Research Scientist',
      annualIncomeINR: 2200000,
      journeyStatus: 'active',
      preferences: {
        ageMin: 27,
        ageMax: 34,
        heightMinCm: 168,
        heightMaxCm: 188,
        religionAccepted: ['Hindu'],
        casteNoBar: true,
        educationMin: 'Bachelors',
        incomeMinINR: 1800000,
        locationPreference: ['Pune', 'Mumbai'],
        diet: ['vegetarian'],
        maritalStatusAccepted: ['never_married'],
        flexibilityScore: 0.8,
      },
    });

    // Create candidate 1
    candidateCustomer1 = await Customer.create({
      profileId: 'DC-SEND-CD-01',
      isClient: false,
      firstName: 'Sameer',
      lastName: 'Patil',
      fullName: 'Sameer Patil',
      email: 'sameer.private@datecrew.in',
      phone: '+91-98222-33344',
      gender: 'male',
      dob: new Date('1994-09-18'),
      maritalStatus: 'never_married',
      heightCm: 176,
      city: 'Pune',
      state: 'Maharashtra',
      religion: 'Hindu',
      caste: 'Maratha',
      motherTongue: 'Marathi',
      avatarSeed: 'seed-sameer',
      diet: 'vegetarian',
      education: 'Masters',
      educationField: 'Data Science',
      occupation: 'AI Engineer',
      annualIncomeINR: 2800000,
      preferences: {
        ageMin: 25,
        ageMax: 30,
        heightMinCm: 155,
        heightMaxCm: 172,
        religionAccepted: ['Hindu'],
        casteNoBar: true,
        educationMin: 'Bachelors',
        incomeMinINR: 1200000,
        locationPreference: ['Pune'],
        diet: ['vegetarian'],
        maritalStatusAccepted: ['never_married'],
        flexibilityScore: 0.7,
      },
    });

    // Create candidate 2
    candidateCustomer2 = await Customer.create({
      profileId: 'DC-SEND-CD-02',
      isClient: false,
      firstName: 'Karan',
      lastName: 'Verma',
      fullName: 'Karan Verma',
      email: 'karan.private@datecrew.in',
      phone: '+91-98333-44455',
      gender: 'male',
      dob: new Date('1993-11-20'),
      maritalStatus: 'never_married',
      heightCm: 180,
      city: 'Mumbai',
      state: 'Maharashtra',
      religion: 'Hindu',
      caste: 'Open',
      motherTongue: 'Hindi',
      avatarSeed: 'seed-karan',
      diet: 'vegetarian',
      education: 'Bachelors',
      educationField: 'Marketing',
      occupation: 'Growth Lead',
      annualIncomeINR: 2400000,
      preferences: {
        ageMin: 25,
        ageMax: 31,
        heightMinCm: 158,
        heightMaxCm: 175,
        religionAccepted: ['Hindu'],
        casteNoBar: true,
        educationMin: 'Bachelors',
        incomeMinINR: 1500000,
        locationPreference: ['Mumbai', 'Pune'],
        diet: ['vegetarian'],
        maritalStatusAccepted: ['never_married'],
        flexibilityScore: 0.8,
      },
    });
  });

  afterEach(() => {
    setDeliveryAdapter(new MockDeliveryAdapter());
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('1. Successful Mock Delivery & Record Creation', () => {
    it('dispatches proposal via mock delivery adapter without claiming a real email was sent', async () => {
      const customIntro =
        'Dear Pooja, we are delighted to introduce Sameer, a skilled AI Engineer based in Pune. You both share an intellectual drive and family values.';

      const res = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientCustomer._id,
          candidateId: candidateCustomer1._id,
          customIntroduction: customIntro,
          notes: 'Discussed during 1-on-1 profile consultation.',
        });

      expect(res.status).toBe(201);
      expect(res.body._id).toBeDefined();
      expect(res.body.clientId).toBe(clientCustomer._id.toString());
      expect(res.body.candidateId).toBe(candidateCustomer1._id.toString());
      expect(res.body.status).toBe('intro_sent');
      expect(res.body.aiIntroduction).toBe(customIntro);
      expect(res.body.sentByName).toBe('Senior Matchmaker Aarti');
      expect(res.body.emailDelivered).toBe(true);

      // Verify mock delivery adapter metadata (does NOT claim real email was sent)
      expect(res.body.deliveryReceipt).toBeDefined();
      expect(res.body.deliveryReceipt.isMock).toBe(true);
      expect(res.body.deliveryReceipt.provider).toBe('mock_delivery_adapter');
      expect(res.body.deliveryReceipt.deliveryStatus).toBe('simulated_delivery');
      expect(res.body.deliveryReceipt.summary).toContain('[Simulated Delivery Event - Demo Mode]');
      expect(res.body.deliveryReceipt.summary).toContain('No real third-party email transmitted');

      // Verify client journey status updated to matched
      const updatedClient = await Customer.findById(clientCustomer._id);
      expect(updatedClient?.journeyStatus).toBe('matched');
    });
  });

  describe('2. Duplicate Requests Prevention', () => {
    it('prevents accidental duplicate sends and returns 409 Conflict', async () => {
      // Candidate 1 was already dispatched in the previous test
      const res = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientCustomer._id,
          candidateId: candidateCustomer1._id,
          customIntroduction: 'Trying to send again...',
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('DUPLICATE_MATCH_PROPOSAL');
      expect(res.body.message).toContain('already been dispatched');
      expect(res.body.existingMatch).toBeDefined();
      expect(res.body.existingMatch.status).toBe('intro_sent');
    });
  });

  describe('3. Invalid Matches & Consent Checkpoint Validation', () => {
    it('returns 400 when clientId or candidateId is missing', async () => {
      const res = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ clientId: clientCustomer._id });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Both clientId and candidateId are required/i);
    });

    it('returns 400 for malformed ObjectId values', async () => {
      const res = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: 'not-valid-id',
          candidateId: candidateCustomer2._id,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid ID format/i);
    });

    it('returns 400 when matching customer with self', async () => {
      const res = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientCustomer._id,
          candidateId: clientCustomer._id,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot be identical/i);
    });

    it('returns 400 when consentApproved is explicitly false', async () => {
      const res = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientCustomer._id,
          candidateId: candidateCustomer2._id,
          consentApproved: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/consent is required/i);
    });

    it('returns 404 when client does not exist', async () => {
      const nonExistent = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: nonExistent,
          candidateId: candidateCustomer2._id,
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Client profile not found/i);
    });

    it('returns 404 when candidate does not exist', async () => {
      const nonExistent = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientCustomer._id,
          candidateId: nonExistent,
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Candidate profile not found/i);
    });
  });

  describe('4. Delivery Adapter Failure Handling', () => {
    it('returns 502 when delivery adapter indicates failed dispatch', async () => {
      // Mock a failing delivery adapter
      const failingAdapter: IDeliveryAdapter = {
        sendMatchIntroduction: (_payload: DeliveryPayload): DeliveryReceipt => ({
          delivered: false,
          isMock: true,
          provider: 'failing_mock_adapter',
          deliveryStatus: 'failed',
          messageId: 'err_001',
          timestamp: new Date(),
          summary: 'Simulated delivery failure',
          error: 'Connection timeout in mail relay',
        }),
      };

      setDeliveryAdapter(failingAdapter);

      const res = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientCustomer._id,
          candidateId: candidateCustomer2._id,
        });

      expect(res.status).toBe(502);
      expect(res.body.message).toMatch(/Delivery adapter failed/i);
      expect(res.body.error).toBe('Connection timeout in mail relay');

      // Ensure no MatchEvent record was committed on failure
      const saved = await MatchEvent.findOne({
        clientId: clientCustomer._id,
        candidateId: candidateCustomer2._id,
      });
      expect(saved).toBeNull();
    });
  });

  describe('5. Match History & Status Lifecycle Updates', () => {
    let createdEventId: string;

    beforeAll(async () => {
      // Reset adapter to working mock and dispatch candidate 2
      setDeliveryAdapter(new MockDeliveryAdapter());
      const dispatchRes = await request(app)
        .post('/api/matches/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientCustomer._id,
          candidateId: candidateCustomer2._id,
          customIntroduction: 'Introduction for Karan Verma.',
        });
      createdEventId = dispatchRes.body._id;
    });

    it('retrieves client match history containing dispatched records with status', async () => {
      const res = await request(app)
        .get(`/api/matches/history/${clientCustomer._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      const found = res.body.find((item: any) => item._id === createdEventId);
      expect(found).toBeDefined();
      expect(found.status).toBe('intro_sent');
      expect(found.candidate.fullName).toBe('Karan Verma');
      expect(found.isMockDelivery).toBe(true);
    });

    it('updates status to meeting_scheduled', async () => {
      const res = await request(app)
        .patch(`/api/matches/${createdEventId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'meeting_scheduled',
          notes: 'Zoom consultation scheduled for this Friday at 5 PM.',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('meeting_scheduled');
      expect(res.body.notes).toContain('Zoom consultation');
    });

    it('updates status to accepted', async () => {
      const res = await request(app)
        .patch(`/api/matches/${createdEventId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('accepted');
    });

    it('updates status to rejected', async () => {
      const res = await request(app)
        .patch(`/api/matches/${createdEventId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'rejected' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('rejected');
    });

    it('rejects invalid status values with 400', async () => {
      const res = await request(app)
        .patch(`/api/matches/${createdEventId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'unknown_stage' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid status/i);
    });
  });
});
