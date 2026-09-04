import type { Request, Response } from 'express'; import { ok } from '../../utils/http.js'; import { vulnerableSearch, vulnerableLogin } from './service.js';
export const search = (req: Request, res: Response) => ok(res, { ...vulnerableSearch(String(req.query.q ?? ''), req.user!.id), lab: { intentionallyVulnerable: true } });
export const login = (req: Request, res: Response) => {
  const result = vulnerableLogin(String(req.body.email ?? ''), String(req.body.password ?? ''), req.user?.id);
  if (result.error) return res.status(401).json({ success: false, error: { message: result.error, code: 'AUTH_FAILED' } });
  return ok(res, { ...result, lab: { intentionallyVulnerable: true } });
};
