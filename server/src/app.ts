import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import customersRoutes from './routes/customers.routes.js';
import matchesRoutes from './routes/matches.routes.js';
import statsRoutes from './routes/stats.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  // Basic security and parsing middleware
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customersRoutes);
  app.use('/api/matches', matchesRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/ai', aiRoutes);

  // 404 handler for undefined API routes
  app.use((_req, res) => {
    res.status(404).json({ message: 'Requested API endpoint not found.' });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
