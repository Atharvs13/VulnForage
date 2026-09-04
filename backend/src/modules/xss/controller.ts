import type {Request,Response} from 'express'; import {ok} from '../../utils/http.js'; import * as service from './service.js';
export const search=(req:Request,res:Response)=>ok(res,{query:service.reflect(String(req.query.q??''),req.user!.id),renderMode:'unsafe-lab-html'});
export const create=(req:Request,res:Response)=>ok(res,{ticket:service.store(req.user!.id,req.body)},201);
export const list=(req:Request,res:Response)=>ok(res,{tickets:service.list(),renderMode:'unsafe-lab-html'});
