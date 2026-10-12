export interface IMockEmailPayload {
  to: string;
  recipientName: string;
  subject: string;
  body: string;
}

export function sendMockEmail(payload: IMockEmailPayload): {
  delivered: boolean;
  messageId: string;
  loggedAt: string;
  content: string;
} {
  const messageId = `mock_mail_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const loggedAt = new Date().toISOString();

  // Log clearly in safe format
  const logSummary = `[Mock Email Adapter] [${loggedAt}] [ID: ${messageId}]
To: ${payload.recipientName} <${payload.to}>
Subject: ${payload.subject}
Message Body:
--------------------------------------------------
${payload.body}
--------------------------------------------------`;

  // Output to console in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    console.log(logSummary);
  }

  return {
    delivered: true,
    messageId,
    loggedAt,
    content: logSummary,
  };
}
