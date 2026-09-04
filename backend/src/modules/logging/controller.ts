import type { Request, Response } from 'express';
import { ok } from '../../utils/http.js';
import { recordLogEvent } from './service.js';

export const logEventController = (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };
  const result = recordLogEvent(req.user!.id, message || 'User activity event');
  return ok(res, { result, lab: { intentionallyVulnerable: true } });
};
