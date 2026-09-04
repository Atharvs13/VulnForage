import type { Request, Response } from 'express';
import { ok } from '../../utils/http.js';
import { lookupHash } from './service.js';

export const hashController = (req: Request, res: Response) => {
  const { hash } = req.body as { hash?: string };
  const result = lookupHash(req.user!.id, hash || '5d41402abc4b2a76b9719d911017c592');
  return ok(res, { result, lab: { intentionallyVulnerable: true } });
};
