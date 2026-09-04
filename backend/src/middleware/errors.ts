import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../utils/errors.js';

export const notFound: RequestHandler = (req, _res, next) => next(new AppError(404, 'ROUTE_NOT_FOUND', `No route matches ${req.method} ${req.path}`));

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const known = error instanceof AppError;
  const status = known ? error.status : 500;
  if (!known) console.error(JSON.stringify({ timestamp: new Date().toISOString(), requestId: req.requestId, eventType: 'SERVER_ERROR', message: error instanceof Error ? error.message : String(error) }));
  res.status(status).json({ success: false, error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'An unexpected server error occurred', requestId: req.requestId } });
};
