import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import { logEvent } from '../services/log.service.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) { logEvent('AUTHZ_FAILURE', { requestId: req.requestId, route: req.path, method: req.method }); next(new AppError(401, 'AUTH_REQUIRED', 'Authentication is required')); return; }
  next();
}

export function requireRole(...roles: Array<'support' | 'admin'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) { next(new AppError(401, 'AUTH_REQUIRED', 'Authentication is required')); return; }
    if (!roles.includes(req.user.role as 'support' | 'admin')) {
      logEvent('AUTHZ_FAILURE', { requestId: req.requestId, userId: req.user.id, route: req.path, method: req.method });
      next(new AppError(403, 'FORBIDDEN', 'You do not have access to this resource')); return;
    }
    next();
  };
}
