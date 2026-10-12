import { Request, Response, NextFunction } from 'express';
import { Customer } from '../models/Customer.model.js';
import { MatchEvent } from '../models/MatchEvent.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { computeMatchingScore } from '../services/matching.service.js';
import { generateIntroduction } from '../services/openai.service.js';
import { sendMockEmail } from '../services/email.service.js';

export async function sendMatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { clientId, candidateId, notes, customIntroduction, introduction } = req.body;

    if (!clientId || !candidateId) {
      res.status(400).json({ message: 'Both clientId and candidateId are required.' });
      return;
    }

    const [client, candidate] = await Promise.all([
      Customer.findById(clientId),
      Customer.findById(candidateId),
    ]);

    if (!client) {
      res.status(404).json({ message: 'Client profile not found.' });
      return;
    }

    if (!candidate) {
      res.status(404).json({ message: 'Candidate profile not found.' });
      return;
    }

    // Compute deterministic snapshot
    const scoreSnapshot = computeMatchingScore(client, candidate);

    // Use edited draft if provided by matchmaker, otherwise generate personalized introduction
    const aiIntroduction =
      (customIntroduction && customIntroduction.trim()) ||
      (introduction && introduction.trim()) ||
      (await generateIntroduction(client, candidate, scoreSnapshot));

    // Mock email dispatch
    const emailDispatch = sendMockEmail({
      to: `client-${client.profileId.toLowerCase()}@fictional-domain.com`,
      recipientName: client.fullName,
      subject: `Curated Matrimonial Match: Introduction to ${candidate.fullName}`,
      body: aiIntroduction,
    });

    // Create persistent MatchEvent
    const matchEvent = await MatchEvent.create({
      clientId: client._id,
      candidateId: candidate._id,
      sentBy: req.user?._id,
      sentByName: req.user?.fullName || 'Matchmaker',
      scoreSnapshot,
      aiIntroduction,
      emailDelivered: emailDispatch.delivered,
      emailLog: emailDispatch.content,
      notes: notes || '',
    });

    // Update client journey status to 'matched' if it's currently 'new' or 'active'
    if (client.journeyStatus === 'new' || client.journeyStatus === 'active') {
      await Customer.findByIdAndUpdate(client._id, { $set: { journeyStatus: 'matched' } });
    }

    // Populate candidate for returned payload
    const populated = await MatchEvent.findById(matchEvent._id)
      .populate('candidateId', 'fullName profileId city occupation education avatarSeed gender')
      .lean();

    res.status(201).json({
      ...populated,
      candidate: (populated as any)?.candidateId,
    });
  } catch (err) {
    next(err);
  }
}

export async function sendMatchByParam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  // Support POST /api/matches/:id/send where :id is the clientId or candidateId
  req.body.clientId = req.params.id;
  return sendMatch(req, res, next);
}

export async function getClientMatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { clientId } = req.params;
    const history = await MatchEvent.find({ clientId })
      .populate('candidateId', 'fullName profileId city occupation education avatarSeed gender')
      .sort({ sentAt: -1 })
      .lean();

    // Map candidateId to candidate for frontend compatibility
    const mapped = history.map((item: any) => ({
      ...item,
      candidate: item.candidateId,
    }));

    res.status(200).json(mapped);
  } catch (err) {
    next(err);
  }
}

export async function getMatchEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { eventId } = req.params;
    const event = await MatchEvent.findById(eventId)
      .populate('candidateId', 'fullName profileId city occupation education avatarSeed gender')
      .lean();

    if (!event) {
      res.status(404).json({ message: 'Match record not found.' });
      return;
    }

    res.status(200).json({
      ...event,
      candidate: (event as any).candidateId,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllMatchesHistory(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const history = await MatchEvent.find()
      .populate('clientId', 'fullName profileId')
      .populate('candidateId', 'fullName profileId city occupation')
      .sort({ sentAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
}

export async function getDashboardOverviewStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalClients, activeClients, matchesSentToday, matchesSentAllTime] = await Promise.all([
      Customer.countDocuments({ isClient: true }),
      Customer.countDocuments({ isClient: true, journeyStatus: 'active' }),
      MatchEvent.countDocuments({ sentAt: { $gte: startOfToday } }),
      MatchEvent.countDocuments(),
    ]);

    res.status(200).json({
      totalClients: totalClients || 40,
      activeClients: activeClients || 28,
      matchesSentToday,
      matchesSentAllTime,
      newThisWeek: 4,
      closedThisMonth: 3,
    });
  } catch (err) {
    next(err);
  }
}
