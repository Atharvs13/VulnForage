import { Router } from 'express';
import * as controller from '../controllers/core.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const productsRouter = Router();
productsRouter.get('/', controller.listProducts);
productsRouter.get('/:id', controller.getProduct);

export const ordersRouter = Router();
ordersRouter.use(requireAuth);
ordersRouter.get('/', controller.listOrders);
ordersRouter.post('/', controller.createOrder);
ordersRouter.get('/:id', controller.getOrder);
ordersRouter.patch('/:id', controller.updateOrder);

export const supportRouter = Router();
supportRouter.use(requireAuth);
supportRouter.get('/tickets', controller.listTickets);
supportRouter.post('/tickets', controller.createTicket);
supportRouter.get('/tickets/:id', controller.getTicket);
supportRouter.patch('/tickets/:id', controller.updateTicket);

export const usersRouter = Router();
usersRouter.get('/me', requireAuth, controller.getProfile);
usersRouter.patch('/me', requireAuth, controller.updateProfile);
usersRouter.get('/:id', requireAuth, controller.publicUser);
