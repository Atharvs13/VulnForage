import{AppError}from'../../utils/errors.js';import{logEvent}from'../../services/log.service.js';
const targets:Record<string,unknown>={'http://lab-internal.local/status':{service:'vf-internal',status:'ready',flag:'VF_INTERNAL_STATUS_200'}};
export function fetchControlled(url:string,userId:number){if(!Object.hasOwn(targets,url))throw new AppError(422,'SSRF_DESTINATION_BLOCKED','Destination is outside the controlled lab allow-list');logEvent('LAB_SSRF_INTERNAL',{userId,metadata:{target:url}});return{url,response:targets[url],networkAccess:'synthetic allow-listed target only'};}
