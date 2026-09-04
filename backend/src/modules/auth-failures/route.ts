import { Router } from 'express';
import { bruteforceController } from './controller.js';

export const authFailuresRouter = Router();
authFailuresRouter.post('/auth/bruteforce', bruteforceController);
