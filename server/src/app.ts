import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
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
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const allowed =
          config.clientOrigins.includes(origin) ||
          origin === 'http://localhost:5173' ||
          origin === 'http://127.0.0.1:5173' ||
          origin.endsWith('.vercel.app');

        if (allowed) {
          return callback(null, true);
        }
        // In development or production fallback
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check and database readiness endpoints (supported at both /health and /api/health)
  const healthHandler = (_req: express.Request, res: express.Response) => {
    const dbState = mongoose.connection.readyState;
    const isReady = dbState === 1;
    const dbStatus =
      dbState === 1
        ? 'connected'
        : dbState === 2
        ? 'connecting'
        : dbState === 3
        ? 'disconnecting'
        : 'disconnected';

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ok' : 'degraded',
      uptime: Math.round(process.uptime()),
      database: dbStatus,
      environment: config.nodeEnv,
      mockDelivery: config.emailMockMode,
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

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
