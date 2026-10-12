import { Router } from 'express';
import {
  sendMatch,
  sendMatchByParam,
  getClientMatchHistory,
  getMatchEventById,
  getAllMatchesHistory,
} from '../controllers/matches.controller.js';
import { getCustomerMatchSuggestions } from '../controllers/customers.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/matches/suggestions/:clientId (Frontend api/matches.ts route)
router.get('/suggestions/:clientId', validateObjectId('clientId'), (req, res, next) => {
  req.params.id = req.params.clientId;
  return getCustomerMatchSuggestions(req, res, next);
});

// POST /api/matches/send and POST /api/matches (Alternative routes)
router.post('/send', sendMatch);
router.post('/', sendMatch);

// POST /api/matches/:id/send
router.post('/:id/send', validateObjectId('id'), sendMatchByParam);

// GET /api/matches/history/:clientId
router.get('/history/:clientId', validateObjectId('clientId'), getClientMatchHistory);

// GET /api/matches/history (Global all matches)
router.get('/history', getAllMatchesHistory);

// GET /api/matches/history/:clientId/:eventId
router.get('/history/:clientId/:eventId', validateObjectId('clientId'), validateObjectId('eventId'), getMatchEventById);

export default router;
