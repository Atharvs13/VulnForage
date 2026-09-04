import{Router}from'express';import{config}from'./controller.js';export const misconfigurationRouter=Router();misconfigurationRouter.get('/debug/config',config);
