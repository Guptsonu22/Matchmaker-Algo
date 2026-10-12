import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequiredFields } from '../middleware/validate.middleware.js';

const router = Router();

// POST /api/auth/login
router.post('/login', validateRequiredFields(['email', 'password']), login);

// GET /api/auth/me (Protected)
router.get('/me', authenticate, getMe);

export default router;
