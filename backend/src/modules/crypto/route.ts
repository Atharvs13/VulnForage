import { Router } from 'express';
import { hashController } from './controller.js';

export const cryptoRouter = Router();
cryptoRouter.post('/crypto/hash', hashController);
