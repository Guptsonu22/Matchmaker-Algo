import dotenv from 'dotenv';
dotenv.config();

const rawOrigins = process.env.CLIENT_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173';
const parsedOrigins = rawOrigins
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/date_crew_db',
  jwtSecret: process.env.JWT_SECRET || 'fallback_development_secret_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: parsedOrigins[0] || 'http://localhost:5173',
  clientOrigins: parsedOrigins,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  openaiEnabled: process.env.OPENAI_ENABLED === 'true' || Boolean(process.env.OPENAI_API_KEY),
  emailMockMode: process.env.EMAIL_MOCK_MODE !== 'false' && process.env.EMAIL_MOCK_MODE !== '0',
  deliveryAdapter: process.env.DELIVERY_ADAPTER || 'mock',
};
