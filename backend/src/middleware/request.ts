import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { config } from '../config/index.js';
import { getUserBySession } from '../services/auth.service.js';
import { logEvent } from '../services/log.service.js';

function cookies(header = ''): Record<string, string> {
  return Object.fromEntries(header.split(';').map((part) => part.trim().split('=')).filter(([key, value]) => key && value).map(([key, value]) => [key!, decodeURIComponent(value!)]));
}

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const started = Date.now();
  req.requestId = String(req.header('x-request-id') ?? randomUUID());
  res.setHeader('x-request-id', req.requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  const sessionId = cookies(req.header('cookie')).vf_session;
  if (sessionId) {
    req.sessionId = sessionId;
    req.user = getUserBySession(sessionId);
  }
  res.on('finish', () => {
    try { logEvent('HTTP_REQUEST', { requestId: req.requestId, userId: req.user?.id, route: req.originalUrl.split('?')[0], method: req.method, statusCode: res.statusCode, metadata: { durationMs: Date.now() - started } }); } catch { /* do not fail the response for audit logging */ }
  });
  next();
}

export function cors(req: Request, res: Response, next: NextFunction): void {
  const origin = req.header('origin');
  if (origin === config.corsOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Request-ID');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  next();
}
