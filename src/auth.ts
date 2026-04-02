import { Request, Response, NextFunction } from 'express';

const SERVICE_KEY = process.env.SERVICE_SECRET_KEY || '';

export function authenticateServiceKey(req: Request, res: Response, next: NextFunction): void {
  if (!SERVICE_KEY) {
    console.warn('[Auth] SERVICE_SECRET_KEY not set — skipping auth');
    next();
    return;
  }

  const provided = req.headers['x-service-key'] as string | undefined;

  if (provided !== SERVICE_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}