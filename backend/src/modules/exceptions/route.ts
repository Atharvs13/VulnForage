import { Router } from 'express';
import { processExceptions } from './controller.js';

export const exceptionsRouter = Router();
exceptionsRouter.post('/exceptions/process', processExceptions);
