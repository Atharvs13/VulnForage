import { Router } from 'express';
import * as controller from '../controllers/mission.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const missionsRouter = Router();
missionsRouter.use(requireAuth);
missionsRouter.get('/', controller.list);
missionsRouter.get('/:id', controller.get);
missionsRouter.post('/:id/start', controller.start);
missionsRouter.post('/:id/attempt', controller.attempt);
missionsRouter.get('/:id/status', controller.status);
