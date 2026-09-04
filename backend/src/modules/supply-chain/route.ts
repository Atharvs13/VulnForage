import { Router } from 'express';
import { manifest } from './controller.js';

export const supplyChainRouter = Router();
supplyChainRouter.get('/supply-chain/manifest', manifest);
