import { Request, Response, NextFunction } from 'express';
import { Customer } from '../models/Customer.model.js';
import { MatchmakerNote } from '../models/MatchmakerNote.model.js';
import { MatchEvent } from '../models/MatchEvent.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { computeMatchingScore } from '../services/matching.service.js';
import { matchCandidates } from '../services/matchmaking/index.js';

export async function listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      gender,
      status,
      religion,
      sortBy = 'createdAt',
      sortDir = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Filter only paying clients
    const query: any = { isClient: true };

    if (gender) {
      query.gender = gender;
    }

    if (status) {
      query.journeyStatus = status;
    }

    if (religion) {
      query.religion = religion;
    }

    if (search && (search as string).trim() !== '') {
      const term = (search as string).trim();
      const regex = new RegExp(term, 'i');
      query.$or = [
        { fullName: regex },
        { city: regex },
        { profileId: regex },
        { occupation: regex },
        { educationField: regex },
      ];
    }

    const sortOrder = sortDir === 'asc' ? 1 : -1;
    const sortObj: any = { [sortBy as string]: sortOrder };

    // Projection excludes heavy nested details in list view for privacy and performance
    const projection =
      'profileId fullName gender dob maritalStatus heightCm city state religion caste occupation annualIncomeINR journeyStatus verificationStatus avatarSeed photoVisibility onboardedAt createdAt';

    const [data, total] = await Promise.all([
      Customer.find(query).select(projection).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Customer.countDocuments(query),
    ]);

    res.status(200).json({
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
}

export async function updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const allowedUpdates = [
      'journeyStatus',
      'verificationStatus',
      'preferences',
      'city',
      'state',
      'occupation',
      'annualIncomeINR',
      'selfDescription',
      'hobbies',
      'diet',
      'smoking',
      'drinking',
    ];

    const updates: any = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const customer = await Customer.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
}

export async function updateCustomerStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { journeyStatus } = req.body;

    if (!journeyStatus || !['new', 'active', 'matched', 'closed'].includes(journeyStatus)) {
      res.status(400).json({ message: 'Valid journeyStatus is required (new, active, matched, closed).' });
      return;
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: { journeyStatus } },
      { new: true }
    );

    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
}

// ─── Customer Notes ──────────────────────────────────────────────────────────

export async function getCustomerNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const notes = await MatchmakerNote.find({ clientId: id }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
}

export async function addCustomerNote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || note.trim() === '') {
      res.status(400).json({ message: 'Note text cannot be empty.' });
      return;
    }

    const customerExists = await Customer.exists({ _id: id });
    if (!customerExists) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    const created = await MatchmakerNote.create({
      clientId: id,
      authorId: req.user?._id,
      authorName: req.user?.fullName || 'Matchmaker',
      note: note.trim(),
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateCustomerNote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { noteId } = req.params;
    const { note } = req.body;

    if (!note || note.trim() === '') {
      res.status(400).json({ message: 'Note text cannot be empty.' });
      return;
    }

    const updated = await MatchmakerNote.findByIdAndUpdate(
      noteId,
      { $set: { note: note.trim() } },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: 'Note not found.' });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteCustomerNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { noteId } = req.params;
    const deleted = await MatchmakerNote.findByIdAndDelete(noteId);

    if (!deleted) {
      res.status(404).json({ message: 'Note not found.' });
      return;
    }

    res.status(200).json({ message: 'Note deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

// ─── Customer Match Suggestions ──────────────────────────────────────────────

export async function getCustomerMatchSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { preset, minScore, limit } = req.query;
    const client = await Customer.findById(id);

    if (!client) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    // Exclude candidates who have already received a proposal or been declined
    const existingMatches = await MatchEvent.find({ clientId: client._id }).select('candidateId').lean();
    const rejectedOrSentIds = existingMatches.map((m) => m.candidateId.toString());

    // Fetch potential candidates excluding self
    const candidatePool = await Customer.find({
      _id: { $ne: client._id },
    }).lean();

    const clientObj = client.toObject ? client.toObject() : client;
    const limitNum = typeof limit === 'string' ? Math.max(1, parseInt(limit, 10)) : 15;
    const minScoreNum = typeof minScore === 'string' ? parseFloat(minScore) : undefined;

    // Run dedicated pure matchmaking algorithm
    const matchResults = matchCandidates(
      clientObj as any,
      (clientObj.preferences || {}) as any,
      candidatePool as any[],
      {
        presetName: typeof preset === 'string' ? preset : undefined,
        minScore: minScoreNum,
        rejectedCandidateIds: rejectedOrSentIds,
        limit: limitNum,
      }
    );

    // Map output to supply full explainability and backward-compatible score object
    const formattedSuggestions = matchResults.map((result) => ({
      candidate: result.candidate,
      score: {
        total: result.score,
        dimensions: {
          ageCompatibility: result.dimensions.mutualAge?.score ?? 0,
          locationMatch: result.dimensions.relocation?.score ?? 0,
          educationAlignment: result.dimensions.education?.score ?? 0,
          incomeAlignment: result.dimensions.income?.score ?? (result.dimensions.career?.score ? result.dimensions.career.score * 0.5 : 0),
          lifestyleHarmony: result.dimensions.lifestyle?.score ?? 0,
          culturalFit: result.dimensions.religion?.score ?? Math.round((result.dimensions.lifestyle?.score ?? 0) * 0.8),
          preferenceReciprocity: result.dimensions.mutualAge?.score ?? 0,
        },
      },
      confidence: result.confidence,
      explanation: result.explanation,
      matchedCriteria: result.matchedCriteria,
      potentialConcerns: result.potentialConcerns,
      matchDimensions: result.dimensions,
    }));

    res.status(200).json(formattedSuggestions);
  } catch (err) {
    next(err);
  }
}
