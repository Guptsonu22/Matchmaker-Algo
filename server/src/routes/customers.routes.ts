import { Router } from 'express';
import {
  listCustomers,
  getCustomerById,
  updateCustomer,
  updateCustomerStatus,
  getCustomerNotes,
  addCustomerNote,
  updateCustomerNote,
  deleteCustomerNote,
  getCustomerMatchSuggestions,
} from '../controllers/customers.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validate.middleware.js';

const router = Router();

// All customer routes require authenticated matchmaker session
router.use(authenticate);

// GET /api/customers - List clients with filters, search, pagination
router.get('/', listCustomers);

// GET /api/customers/:id - Full biodata details
router.get('/:id', validateObjectId('id'), getCustomerById);

// PATCH /api/customers/:id - General profile fields update
router.patch('/:id', validateObjectId('id'), updateCustomer);

// PATCH /api/customers/:id/status - Dedicated journey status update
router.patch('/:id/status', validateObjectId('id'), updateCustomerStatus);

// GET & POST /api/customers/:id/notes - Operational notes
router.get('/:id/notes', validateObjectId('id'), getCustomerNotes);
router.post('/:id/notes', validateObjectId('id'), addCustomerNote);

// PATCH & DELETE /api/customers/:id/notes/:noteId
router.patch('/:id/notes/:noteId', validateObjectId('id'), validateObjectId('noteId'), updateCustomerNote);
router.delete('/:id/notes/:noteId', validateObjectId('id'), validateObjectId('noteId'), deleteCustomerNote);

// GET /api/customers/:id/matches - Match recommendations route
router.get('/:id/matches', validateObjectId('id'), getCustomerMatchSuggestions);

export default router;
