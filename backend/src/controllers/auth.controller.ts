import type { Request, Response } from 'express';
import { config } from '../config/index.js';
import { createSession, deleteSession, login, register } from '../services/auth.service.js';
import { logEvent } from '../services/log.service.js';
import { ok } from '../utils/http.js';

const cookie = (id: string, maxAge: number) => `vf_session=${encodeURIComponent(id)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${config.nodeEnv === 'production' ? '; Secure' : ''}`;

function authenticate(res: Response, user: ReturnType<typeof login>) {
  const id = createSession(user.id, config.sessionTtlHours);
  res.setHeader('Set-Cookie', cookie(id, config.sessionTtlHours * 3600));
  return id;
}

export function registerController(req: Request, res: Response): void {
  const user = register(req.body); authenticate(res, user);
  logEvent('REGISTER', { requestId: req.requestId, userId: user.id, route: req.path, method: req.method });
  ok(res, { user }, 201);
}

export function loginController(req: Request, res: Response): void {
  try {
    const user = login(req.body); authenticate(res, user);
    logEvent('LOGIN', { requestId: req.requestId, userId: user.id, route: req.path, method: req.method });
    ok(res, { user });
  } catch (error) {
    logEvent('AUTH_FAILURE', { requestId: req.requestId, route: req.path, method: req.method, metadata: { email: String(req.body?.email ?? '') } });
    throw error;
  }
}

export function logoutController(req: Request, res: Response): void {
  deleteSession(req.sessionId);
  res.setHeader('Set-Cookie', cookie('', 0));
  logEvent('LOGOUT', { requestId: req.requestId, userId: req.user?.id, route: req.path, method: req.method });
  ok(res, { loggedOut: true });
}

export function meController(req: Request, res: Response): void { ok(res, { user: req.user }); }
