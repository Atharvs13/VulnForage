import type { Request, Response } from 'express';
import { getMission, listMissions, startMission, submitAttempt } from '../services/mission.service.js';
import { ok } from '../utils/http.js';

export const list = (req: Request, res: Response) => ok(res, { missions: listMissions(req.user!.id) });
export const get = (req: Request, res: Response) => ok(res, { mission: getMission(String(req.params.id), req.user!.id) });
export const start = (req: Request, res: Response) => ok(res, { mission: startMission(String(req.params.id), req.user!.id) });
export const attempt = (req: Request, res: Response) => ok(res, submitAttempt(String(req.params.id), req.user!.id, req.body));
export const status = get;
