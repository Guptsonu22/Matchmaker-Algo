import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Customer } from '../models/Customer.model.js';
import { MatchEvent, MatchStatus } from '../models/MatchEvent.model.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { computeMatchingScore } from '../services/matching.service.js';
import { generateIntroduction } from '../services/openai.service.js';
import { getDeliveryAdapter } from '../services/delivery/delivery.adapter.js';

export async function sendMatch(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { clientId, candidateId, notes, customIntroduction, introduction, consentApproved } =
      req.body;

    // 1. Validation: required fields
    if (!clientId || !candidateId) {
      res.status(400).json({ message: 'Both clientId and candidateId are required.' });
      return;
    }

    // 2. Validation: valid ObjectId formats
    if (
      !mongoose.Types.ObjectId.isValid(clientId) ||
      !mongoose.Types.ObjectId.isValid(candidateId)
    ) {
      res.status(400).json({ message: 'Invalid ID format for clientId or candidateId.' });
      return;
    }

    // 3. Validation: prevent self-matching
    if (clientId.toString() === candidateId.toString()) {
      res.status(400).json({ message: 'Client ID and Candidate ID cannot be identical.' });
      return;
    }

    // 4. Validation: consent checkpoint
    if (consentApproved === false) {
      res.status(400).json({
        message:
          'Matchmaker profile sharing approval and client consent is required before dispatching.',
      });
      return;
    }

    // 5. Retrieve client and candidate
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

    // 6. Prevent accidental duplicate sends
    const existingMatch = await MatchEvent.findOne({
      clientId: client._id,
      candidateId: candidate._id,
    });

    if (existingMatch) {
      res.status(409).json({
        message: `A match proposal has already been dispatched for candidate ${candidate.fullName} to this client.`,
        code: 'DUPLICATE_MATCH_PROPOSAL',
        existingMatch: {
          _id: existingMatch._id,
          status: existingMatch.status,
          sentAt: existingMatch.sentAt,
        },
      });
      return;
    }

    // 7. Compute deterministic compatibility snapshot
    const scoreSnapshot = computeMatchingScore(client, candidate);

    // 8. Determine introduction text (editable matchmaker draft or generated intro)
    const aiIntroduction =
      (customIntroduction && customIntroduction.trim()) ||
      (introduction && introduction.trim()) ||
      (await generateIntroduction(client, candidate, scoreSnapshot));

    // 9. Dispatch through delivery adapter (MockDeliveryAdapter in demo mode)
    const deliveryAdapter = getDeliveryAdapter();
    const deliveryReceipt = await deliveryAdapter.sendMatchIntroduction({
      to: `client-${client.profileId.toLowerCase()}@fictional-domain.com`,
      recipientName: client.fullName,
      subject: `Curated Matrimonial Match: Introduction to ${candidate.fullName}`,
      body: aiIntroduction,
      clientId: client._id.toString(),
      candidateId: candidate._id.toString(),
    });

    if (!deliveryReceipt.delivered) {
      res.status(502).json({
        message: 'Delivery adapter failed to dispatch proposal.',
        error: deliveryReceipt.error,
      });
      return;
    }

    // 10. Save complete persistent MatchEvent record
    const matchEvent = await MatchEvent.create({
      clientId: client._id,
      candidateId: candidate._id,
      sentBy: req.user?._id,
      sentByName: req.user?.fullName || 'Matchmaker',
      sentAt: deliveryReceipt.timestamp || new Date(),
      status: 'intro_sent',
      scoreSnapshot,
      aiIntroduction,
      emailDelivered: deliveryReceipt.delivered,
      deliveryProvider: deliveryReceipt.provider,
      deliveryStatus: deliveryReceipt.deliveryStatus,
      isMockDelivery: deliveryReceipt.isMock,
      emailLog: deliveryReceipt.summary,
      notes: notes || '',
    });

    // 11. Update client journey status to 'matched' if currently 'new' or 'active'
    if (client.journeyStatus === 'new' || client.journeyStatus === 'active') {
      await Customer.findByIdAndUpdate(client._id, { $set: { journeyStatus: 'matched' } });
    }

    // 12. Populate candidate for returned payload
    const populated = await MatchEvent.findById(matchEvent._id)
      .populate('candidateId', 'fullName profileId city occupation education avatarSeed gender')
      .lean();

    res.status(201).json({
      ...populated,
      candidate: (populated as any)?.candidateId,
      deliveryReceipt,
    });
  } catch (err) {
    next(err);
  }
}

export async function sendMatchByParam(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Support POST /api/matches/:id/send where :id is the clientId
  req.body.clientId = req.params.id;
  return sendMatch(req, res, next);
}

export async function updateMatchStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid match ID format.' });
      return;
    }

    const validStatuses: MatchStatus[] = [
      'shortlisted',
      'intro_sent',
      'meeting_scheduled',
      'accepted',
      'rejected',
      'proposed',
      'viewed',
      'declined',
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const updateData: any = { status };
    if (typeof notes === 'string') {
      updateData.notes = notes;
    }

    const updated = await MatchEvent.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate('candidateId', 'fullName profileId city occupation education avatarSeed gender')
      .lean();

    if (!updated) {
      res.status(404).json({ message: 'Match record not found.' });
      return;
    }

    res.status(200).json({
      ...updated,
      candidate: (updated as any)?.candidateId,
    });
  } catch (err) {
    next(err);
  }
}

export async function getClientMatchHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { clientId } = req.params;
    const history = await MatchEvent.find({ clientId })
      .populate('candidateId', 'fullName profileId city occupation education avatarSeed gender')
      .sort({ sentAt: -1 })
      .lean();

    const mapped = history.map((item: any) => ({
      ...item,
      candidate: item.candidateId,
    }));

    res.status(200).json(mapped);
  } catch (err) {
    next(err);
  }
}

export async function getMatchEventById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

export async function getAllMatchesHistory(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

export async function getDashboardOverviewStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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
