import { Router } from 'express'; import { search } from './controller.js'; export const sqliRouter = Router(); sqliRouter.get('/products/search', search);
