import type { Request, Response } from 'express'; import { ok } from '../../utils/http.js'; import { vulnerableSearch } from './service.js';
export const search = (req: Request, res: Response) => ok(res, { ...vulnerableSearch(String(req.query.q ?? ''), req.user!.id), lab: { intentionallyVulnerable: true } });
