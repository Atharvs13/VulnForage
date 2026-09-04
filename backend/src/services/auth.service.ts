import { randomBytes } from 'node:crypto';
import { db } from '../database/index.js';
import { AppError, assert } from '../utils/errors.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

export type AuthUser = { id: number; email: string; role: 'guest' | 'user' | 'support' | 'admin'; displayName: string };

const publicUserQuery = `SELECT u.id,u.email,u.role,p.display_name AS displayName
  FROM users u JOIN profiles p ON p.user_id=u.id`;

export function getUserBySession(sessionId: string): AuthUser | undefined {
  return db().prepare(`${publicUserQuery} JOIN sessions s ON s.user_id=u.id WHERE s.id=? AND s.expires_at > CURRENT_TIMESTAMP`).get(sessionId) as AuthUser | undefined;
}

export function register(input: unknown): AuthUser {
  const value = input as Record<string, unknown>;
  const email = String(value?.email ?? '').trim().toLowerCase();
  const password = String(value?.password ?? '');
  const displayName = String(value?.displayName ?? email.split('@')[0] ?? '').trim();
  assert(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email), 422, 'INVALID_EMAIL', 'Enter a valid email address');
  assert(password.length >= 10, 422, 'WEAK_PASSWORD', 'Password must be at least 10 characters');
  assert(displayName.length >= 2 && displayName.length <= 60, 422, 'INVALID_DISPLAY_NAME', 'Display name must be 2–60 characters');
  try {
    const result = db().prepare('INSERT INTO users (email,password_hash,role) VALUES (?,?,?)').run(email, hashPassword(password), 'user');
    const id = Number(result.lastInsertRowid);
    db().prepare('INSERT INTO profiles (user_id,display_name,bio,shipping_address) VALUES (?,?,?,?)').run(id, displayName, '', '');
    return { id, email, role: 'user', displayName };
  } catch (error) {
    if (String(error).includes('UNIQUE')) throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    throw error;
  }
}

export function login(input: unknown): AuthUser {
  const value = input as Record<string, unknown>;
  const email = String(value?.email ?? '').trim().toLowerCase();
  const password = String(value?.password ?? '');
  const row = db().prepare(`${publicUserQuery} WHERE u.email=?`).get(email) as (AuthUser & { password_hash?: string }) | undefined;
  const authRow = db().prepare('SELECT password_hash FROM users WHERE email=?').get(email) as { password_hash: string } | undefined;
  if (!row || !authRow || !verifyPassword(password, authRow.password_hash)) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  return row;
}

export function createSession(userId: number, ttlHours: number): string {
  const id = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + ttlHours * 3_600_000).toISOString();
  db().prepare('INSERT INTO sessions (id,user_id,expires_at) VALUES (?,?,?)').run(id, userId, expires);
  return id;
}

export function deleteSession(id: string | undefined): void {
  if (id) db().prepare('DELETE FROM sessions WHERE id=?').run(id);
}
