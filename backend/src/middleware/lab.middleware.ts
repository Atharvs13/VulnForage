import type { NextFunction, Request, Response } from 'express';
import { config } from '../config/index.js';
import { AppError } from '../utils/errors.js';

export function requireLabMode(_req: Request, _res: Response, next: NextFunction): void {
  next(config.labMode ? undefined : new AppError(404, 'LAB_DISABLED', 'Lab routes are disabled'));
}
