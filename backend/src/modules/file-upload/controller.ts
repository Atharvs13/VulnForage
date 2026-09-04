import type{Request,Response}from'express';import{ok}from'../../utils/http.js';import*as service from'./service.js';
export const upload=(req:Request,res:Response)=>ok(res,{upload:service.store(req.user!.id,req.file!),lab:{intentionallyVulnerable:true}},201);
export const get=(req:Request,res:Response)=>{const result=service.get(String(req.params.id));res.type('text/plain').setHeader('Content-Disposition','inline');res.sendFile(result.file);};
