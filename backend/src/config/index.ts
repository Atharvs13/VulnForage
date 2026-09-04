import path from 'node:path';

const port = Number(process.env.PORT ?? 4000);
const databaseUrl = process.env.DATABASE_URL ?? './data/vulnforge.db';

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  labMode: process.env.LAB_MODE !== 'false',
  databasePath: path.resolve(databaseUrl),
  sessionSecret: process.env.SESSION_SECRET ?? 'local-development-only-change-me',
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 12),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  uploadMaxBytes: Number(process.env.UPLOAD_MAX_BYTES ?? 1_048_576),
  labJwtSecret: process.env.LAB_JWT_SECRET ?? 'training-secret-only',
};

export function validateConfig(): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.push('PORT');
  if (!config.databasePath) errors.push('DATABASE_URL');
  if (!config.sessionSecret) errors.push('SESSION_SECRET');
  return errors;
}
