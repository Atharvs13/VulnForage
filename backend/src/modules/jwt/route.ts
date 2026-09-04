import{Router}from'express';import*as c from'./controller.js';export const jwtRouter=Router();jwtRouter.post('/jwt/login',c.login);jwtRouter.get('/jwt/profile',c.profile);
