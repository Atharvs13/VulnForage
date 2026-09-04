import { Router } from 'express';
import { logEventController } from './controller.js';

export const loggingRouter = Router();
loggingRouter.post('/logging/event', logEventController);
