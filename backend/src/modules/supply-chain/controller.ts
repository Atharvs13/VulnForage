import type { Request, Response } from 'express';
import { ok } from '../../utils/http.js';
import { getManifest } from './service.js';

export const manifest = (req: Request, res: Response) =>
  ok(res, { manifest: getManifest(req.user!.id), lab: { intentionallyVulnerable: true } });
