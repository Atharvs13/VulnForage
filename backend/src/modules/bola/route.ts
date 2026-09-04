import { Router } from 'express'; import { get } from './controller.js';
export const bolaRouter = Router(); bolaRouter.get('/orders/:id', get);
