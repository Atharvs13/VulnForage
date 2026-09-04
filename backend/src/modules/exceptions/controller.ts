import type { Request, Response } from 'express';
import { ok } from '../../utils/http.js';
import { processEvaluator } from './service.js';

export const processExceptions = (req: Request, res: Response) => {
  const result = processEvaluator(req.user!.id, req.body);
  return ok(res, { result, lab: { intentionallyVulnerable: true } });
};
