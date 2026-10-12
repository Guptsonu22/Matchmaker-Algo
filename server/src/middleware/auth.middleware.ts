import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User, IUser } from '../models/User.model.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required. No Bearer token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Malformed authorization token.' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      res.status(401).json({ message: 'User belonging to this token no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Session expired. Please log in again.' });
      return;
    }
    res.status(401).json({ message: 'Invalid or forged authentication token.' });
  }
}

export function authorizeRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Access forbidden: Insufficient permissions for this operational action.',
      });
      return;
    }
    next();
  };
}
