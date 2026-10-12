import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Customer } from '../models/Customer.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
  generateAIMatchIntroduction,
  generateCuratedFallbackIntro,
  countWords,
  MinimumProfileFacts,
} from '../services/ai.service.js';
import { computeMatchingScore } from '../services/matching.service.js';

// Safe mapping function to extract ONLY the minimum necessary profile facts
function extractMinimumProfileFacts(doc: any): MinimumProfileFacts {
  return {
    id: doc._id.toString(),
    firstName: doc.firstName || doc.fullName?.split(' ')[0] || '',
    fullName: doc.fullName || '',
    gender: doc.gender || '',
    city: doc.city || '',
    state: doc.state || '',
    occupation: doc.occupation || '',
    education: doc.education || '',
    educationField: doc.educationField || '',
    hobbies: Array.isArray(doc.hobbies) ? doc.hobbies : [],
    diet: doc.diet || '',
    familyValues: doc.familyValues || '',
  };
}

export async function createMatchIntroduction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.body.customerId || req.body.clientId;
    const candidateId = req.body.candidateId;
    const { score, explanation } = req.body;

    // 1. Validate required profile IDs
    if (!customerId || !candidateId) {
      res.status(400).json({
        message: 'Both customerId (or clientId) and candidateId are required.',
      });
      return;
    }

    // 2. Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !mongoose.Types.ObjectId.isValid(candidateId)
    ) {
      res.status(400).json({
        message: 'Invalid ID format for customerId or candidateId.',
      });
      return;
    }

    // 3. Ensure not matching self
    if (customerId.toString() === candidateId.toString()) {
      res.status(400).json({
        message: 'Customer ID and Candidate ID cannot be identical.',
      });
      return;
    }

    // 4. Retrieve ONLY the minimum necessary profile information
    // Exclude private contact details (phone, email), caste, religion, income, and astrology
    const projection =
      'firstName lastName fullName gender dob city state occupation education educationField hobbies diet familyValues';

    const [customer, candidate] = await Promise.all([
      Customer.findById(customerId).select(projection).lean(),
      Customer.findById(candidateId).select(projection).lean(),
    ]);

    if (!customer) {
      res.status(404).json({ message: 'Customer profile not found.' });
      return;
    }

    if (!candidate) {
      res.status(404).json({ message: 'Candidate profile not found.' });
      return;
    }

    const clientProfile = extractMinimumProfileFacts(customer);
    const candidateProfile = extractMinimumProfileFacts(candidate);

    // Compute or validate deterministic score
    let scoreSnapshot = score;
    let scoreTotal = 80;

    if (typeof score === 'number') {
      scoreTotal = Math.min(100, Math.max(0, score));
    } else if (typeof score?.total === 'number') {
      scoreTotal = Math.min(100, Math.max(0, score.total));
    } else if ((customer as any).preferences) {
      scoreSnapshot = computeMatchingScore(customer as any, candidate as any);
      scoreTotal = scoreSnapshot.total;
    }

    // Safe operational logging (no PII or secrets)
    console.log(
      `[AI Controller] Match intro requested for customer ${customer._id} and candidate ${candidate._id} (Score: ${scoreTotal}%)`
    );

    // If soft rate-limit reached for this user, return fallback gracefully
    if ((req as any).isRateLimited) {
      const fallbackText = generateCuratedFallbackIntro(
        clientProfile,
        candidateProfile,
        scoreTotal,
        typeof explanation === 'string' ? explanation : explanation?.summary
      );
      res.status(200).json({
        success: true,
        introduction: fallbackText,
        source: 'fallback',
        fallbackReason: 'rate_limited',
        wordCount: countWords(fallbackText),
      });
      return;
    }

    // Generate introduction via AI Service (with automatic timeout, Responses API & error fallback)
    const result = await generateAIMatchIntroduction({
      clientProfile,
      candidateProfile,
      score: scoreSnapshot || scoreTotal,
      explanation,
    });

    res.status(200).json({
      success: true,
      introduction: result.introduction,
      source: result.source,
      fallbackReason: result.fallbackReason,
      wordCount: result.wordCount,
      modelUsed: result.modelUsed,
    });
  } catch (err) {
    next(err);
  }
}
