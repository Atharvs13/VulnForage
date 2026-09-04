import express from 'express';
import { config, validateConfig } from './config/index.js';
import { db, initializeDatabase } from './database/index.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { cors, requestContext } from './middleware/request.js';
import { adminRouter } from './routes/admin.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { ordersRouter, productsRouter, supportRouter, usersRouter } from './routes/core.routes.js';
import { labRouter } from './routes/lab.routes.js';
import { missionsRouter } from './routes/mission.routes.js';
import { uploadsRouter } from './routes/upload.routes.js';
import { ok } from './utils/http.js';

export function createApp() {
  initializeDatabase();
  const app = express();
  app.disable('x-powered-by');
  app.use(cors, express.json({ limit: '256kb' }), requestContext);
  app.get('/health', (_req, res) => {
    const database = (db().prepare('SELECT 1 AS ok').get() as { ok: number }).ok === 1;
    const missing = validateConfig();
    ok(res, { status: database && missing.length === 0 ? 'healthy' : 'degraded', database: database ? 'reachable' : 'unreachable', configuration: missing.length ? { valid: false, missing } : { valid: true }, labMode: config.labMode });
  });
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/support', supportRouter);
  app.use('/api/uploads', uploadsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/missions', missionsRouter);
  app.use('/api/lab', labRouter);
  app.use(notFound, errorHandler);
  return app;
}
