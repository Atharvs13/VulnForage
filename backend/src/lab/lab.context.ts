import type { Request } from 'express';

export interface LabContext {
  userId: number;
  requestId: string;
  endpoint: string;
  method: string;
}

export function labContext(req: Request): LabContext {
  return {
    userId: req.user!.id,
    requestId: req.requestId,
    endpoint: req.originalUrl.split('?')[0] ?? req.path,
    method: req.method,
  };
}
