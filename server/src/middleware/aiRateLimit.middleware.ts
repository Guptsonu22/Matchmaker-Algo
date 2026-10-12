import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

/**
 * Sensible rate limiting for AI match introduction endpoint.
 * Attaches req.isRateLimited = true if soft limit reached so controller can return fallback introduction.
 * Returns 429 if hard threshold is exceeded.
 */
export function aiRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute window
  const maxRequests = options.maxRequests || 30; // 30 requests per minute

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const identifier = req.user?._id?.toString() || req.ip || 'anonymous';
    const now = Date.now();

    const existing = rateLimitMap.get(identifier);

    if (!existing || now > existing.resetTime) {
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    existing.count += 1;

    // Hard cap: 3x limit returns standard 429
    if (existing.count > maxRequests * 3) {
      res.status(429).json({
        message: 'Excessive requests to AI service. Please wait a minute before retrying.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }

    // Soft limit: mark request as rate-limited so controller returns fallback intro
    if (existing.count > maxRequests) {
      (req as any).isRateLimited = true;
    }

    next();
  };
}

export function resetRateLimits(): void {
  rateLimitMap.clear();
}
