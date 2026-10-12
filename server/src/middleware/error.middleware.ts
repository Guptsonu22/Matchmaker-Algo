import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Safe logging: avoid dumping credentials or sensitive customer payloads
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const isProd = config.nodeEnv === 'production';

  if (!isProd && config.nodeEnv !== 'test') {
    console.error('[API Error]:', err.message, err.stack);
  }

  // Handle Mongoose validation errors gracefully
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e: any) => e.message);
    res.status(400).json({
      message: 'Validation failed',
      errors: messages,
    });
    return;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    res.status(409).json({
      message: `A record with this ${field} already exists.`,
    });
    return;
  }

  // Handle CastError (invalid ObjectId in query)
  if (err.name === 'CastError') {
    res.status(400).json({
      message: `Resource not found with malformed ID: ${err.value}`,
    });
    return;
  }

  res.status(statusCode).json({
    message: err.message || 'An unexpected operational server error occurred.',
    ...(isProd ? {} : { stack: err.stack }),
  });
}
