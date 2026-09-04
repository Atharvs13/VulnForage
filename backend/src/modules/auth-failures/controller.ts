import type { Request, Response } from 'express';
import { ok } from '../../utils/http.js';
import { bruteforceLogin } from './service.js';

export const bruteforceController = (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  const result = bruteforceLogin(req.user!.id, password || '');
  return ok(res, { result, lab: { intentionallyVulnerable: true } });
};
