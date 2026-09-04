import{Router}from'express';import{fetchTarget}from'./controller.js';export const ssrfRouter=Router();ssrfRouter.post('/ssrf/fetch',fetchTarget);
