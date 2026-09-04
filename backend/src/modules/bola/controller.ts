import type { Request, Response } from 'express';
import { ok } from '../../utils/http.js';
import { vulnerableOrder } from './service.js';
export const get = (req: Request, res: Response) => ok(res, { order: vulnerableOrder(Number(req.params.id), req.user!.id), lab: { intentionallyVulnerable: true } });
