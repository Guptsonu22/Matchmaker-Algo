import { Router } from 'express';
import { getDashboardOverviewStats } from '../controllers/matches.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/stats/overview
router.get('/overview', getDashboardOverviewStats);

export default router;
