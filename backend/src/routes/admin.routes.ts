import { Router } from 'express';
import { db } from '../database/index.js';
import { resetLab } from '../lab/lab.reset.js';
import { requireRole } from '../middleware/auth.js';
import { listOrders, listTickets } from '../services/core.service.js';
import { logEvent } from '../services/log.service.js';
import { resetAllSyntheticState } from '../services/reset.service.js';
import { ok } from '../utils/http.js';

export const adminRouter = Router();
adminRouter.use(requireRole('admin'));
adminRouter.get('/', (_req, res) => ok(res, { summary: { users: (db().prepare('SELECT count(*) AS n FROM users').get() as {n:number}).n, orders: (db().prepare('SELECT count(*) AS n FROM orders').get() as {n:number}).n, tickets: (db().prepare('SELECT count(*) AS n FROM support_tickets').get() as {n:number}).n, missions: (db().prepare('SELECT count(*) AS n FROM missions').get() as {n:number}).n } }));
adminRouter.get('/users', (_req, res) => ok(res, { users: db().prepare('SELECT id,email,role,created_at AS createdAt FROM users ORDER BY id').all() }));
adminRouter.get('/orders', (req, res) => ok(res, { orders: listOrders(req.user!.id, true) }));
adminRouter.get('/tickets', (req, res) => ok(res, { tickets: listTickets(req.user!.id, true) }));
adminRouter.get('/logs', (_req, res) => ok(res, { logs: db().prepare('SELECT * FROM admin_logs ORDER BY id DESC LIMIT 100').all() }));
adminRouter.post('/lab/reset', (req, res) => {
  resetAllSyntheticState();
  logEvent('LAB_RESET', { requestId: req.requestId, userId: req.user!.id, route: req.path, method: req.method });
  ok(res, { reset: true, message: 'Synthetic lab state restored; sign in again because sessions were reset.' });
});
adminRouter.post('/labs/:labId/reset', (req, res) => {
  const result = resetLab(String(req.params.labId));
  logEvent('LAB_RESET', { requestId: req.requestId, userId: req.user!.id, route: req.path, method: req.method, missionId: result.labId });
  ok(res, result);
});
