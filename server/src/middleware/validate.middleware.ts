import { Request, Response, NextFunction } from 'express';
import mongoose from 'express';

export function validateObjectId(paramName: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400).json({
        message: `Invalid identifier provided for parameter '${paramName}'. Expected 24-character hex ObjectId.`,
      });
      return;
    }
    next();
  };
}

export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = fields.filter((f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === '');
    if (missing.length > 0) {
      res.status(400).json({
        message: `Missing required request body fields: ${missing.join(', ')}`,
      });
      return;
    }
    next();
  };
}
