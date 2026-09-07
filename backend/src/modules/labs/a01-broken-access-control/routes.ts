import { Router } from 'express';
import * as controller from './controller.js';

export const a01Router = Router();
a01Router.get('/orders/:id', controller.getDirectOrder);
a01Router.get('/users/:userId/orders/:orderId', controller.getNestedOrder);
a01Router.get('/access/roles', controller.roles);
a01Router.get('/access/resources', controller.resources);
a01Router.patch('/access/resources/:id', controller.reclassify);
