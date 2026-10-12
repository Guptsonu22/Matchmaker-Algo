export interface DeliveryPayload {
  to: string;
  recipientName: string;
  subject: string;
  body: string;
  clientId: string;
  candidateId: string;
}

export interface DeliveryReceipt {
  delivered: boolean;
  isMock: boolean;
  provider: string;
  deliveryStatus: 'simulated_delivery' | 'delivered' | 'failed';
  messageId: string;
  timestamp: Date;
  summary: string;
  error?: string;
}

export interface IDeliveryAdapter {
  sendMatchIntroduction(payload: DeliveryPayload): Promise<DeliveryReceipt> | DeliveryReceipt;
}

/**
 * Mock Delivery Adapter for Demo Mode.
 * Records simulated delivery events without sending real external emails.
 */
export class MockDeliveryAdapter implements IDeliveryAdapter {
  sendMatchIntroduction(payload: DeliveryPayload): DeliveryReceipt {
    const timestamp = new Date();
    const messageId = `mock_dispatch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const summary = `[Simulated Delivery Event - Demo Mode]
Provider: MockDeliveryAdapter (Demo Mode)
Timestamp: ${timestamp.toISOString()}
Message ID: ${messageId}
Recipient: ${payload.recipientName} <${payload.to}>
Subject: ${payload.subject}
Simulated Delivery: Delivery event recorded internally. No real third-party email transmitted.`;

    if (process.env.NODE_ENV !== 'test') {
      console.log(summary);
    }

    return {
      delivered: true,
      isMock: true,
      provider: 'mock_delivery_adapter',
      deliveryStatus: 'simulated_delivery',
      messageId,
      timestamp,
      summary,
    };
  }
}

// Current active delivery adapter instance
let activeDeliveryAdapter: IDeliveryAdapter = new MockDeliveryAdapter();

export function getDeliveryAdapter(): IDeliveryAdapter {
  return activeDeliveryAdapter;
}

export function setDeliveryAdapter(adapter: IDeliveryAdapter): void {
  activeDeliveryAdapter = adapter;
}
