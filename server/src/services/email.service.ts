import {
  getDeliveryAdapter,
  DeliveryPayload,
  DeliveryReceipt,
  IDeliveryAdapter,
  MockDeliveryAdapter,
  setDeliveryAdapter,
} from './delivery/delivery.adapter.js';

export {
  DeliveryPayload,
  DeliveryReceipt,
  IDeliveryAdapter,
  MockDeliveryAdapter,
  getDeliveryAdapter,
  setDeliveryAdapter,
};

export interface IMockEmailPayload {
  to: string;
  recipientName: string;
  subject: string;
  body: string;
  clientId?: string;
  candidateId?: string;
}

export function sendMockEmail(payload: IMockEmailPayload): {
  delivered: boolean;
  messageId: string;
  loggedAt: string;
  content: string;
} {
  const adapter = getDeliveryAdapter();
  const receipt = adapter.sendMatchIntroduction({
    to: payload.to,
    recipientName: payload.recipientName,
    subject: payload.subject,
    body: payload.body,
    clientId: payload.clientId || 'unknown_client',
    candidateId: payload.candidateId || 'unknown_candidate',
  });

  return {
    delivered: (receipt as DeliveryReceipt).delivered,
    messageId: (receipt as DeliveryReceipt).messageId,
    loggedAt: (receipt as DeliveryReceipt).timestamp.toISOString(),
    content: (receipt as DeliveryReceipt).summary,
  };
}
