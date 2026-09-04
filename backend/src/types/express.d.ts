import type { AuthUser } from '../services/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: AuthUser;
      sessionId?: string;
    }
  }
}

export {};
