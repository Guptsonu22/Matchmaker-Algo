import { Router } from 'express';
import { createMatchIntroduction } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimit.middleware.js';

const router = Router();

// 1. Authenticate and authorize all AI requests
router.use(authenticate);

// 2. POST /api/ai/match-introduction with rate limiting & timeout handling
router.post('/match-introduction', aiRateLimiter(), createMatchIntroduction);

export default router;
