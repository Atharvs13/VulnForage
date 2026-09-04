import type{Request,Response}from'express';import{ok}from'../../utils/http.js';import*as service from'./service.js';
export const login=(req:Request,res:Response)=>ok(res,{auth:service.login(String(req.body?.username??''),String(req.body?.password??''))});
export const profile=(req:Request,res:Response)=>{const token=String(req.header('authorization')??'').replace(/^Bearer\s+/i,'');ok(res,{profile:service.profile(token,req.user!.id),lab:{intentionallyVulnerable:true}});};
