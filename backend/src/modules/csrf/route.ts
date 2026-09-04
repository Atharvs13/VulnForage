import{Router}from'express';import{change}from'./controller.js';export const csrfRouter=Router();csrfRouter.post('/csrf/change-email',change);
