import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireLabMode } from '../middleware/lab.middleware.js';
import { getLab, listLabs } from '../lab/lab.registry.js';
import { ok } from '../utils/http.js';
import { a01Router } from '../modules/labs/a01-broken-access-control/routes.js';
import { a02Router } from '../modules/labs/a02-security-misconfiguration/index.js';
import { a03Router } from '../modules/labs/a03-supply-chain/index.js';
import { cryptoRouter, jwtRouter } from '../modules/labs/a04-cryptographic-failures/index.js';
import { sqliLogin, sqliRouter, ssrfRouter, xssRouter } from '../modules/labs/a05-injection/index.js';
import { a06Router, csrfRouter } from '../modules/labs/a06-insecure-design/index.js';
import { a07Router } from '../modules/labs/a07-authentication-failures/index.js';
import { a08Router } from '../modules/labs/a08-integrity-failures/index.js';
import { a09Router } from '../modules/labs/a09-logging/index.js';
import { a10Router } from '../modules/labs/a10-exceptional-conditions/index.js';

export const labRouter = Router();
labRouter.use(requireLabMode);

// Public lab routes
labRouter.post('/sqli/login', sqliLogin);

labRouter.use(requireAuth);
labRouter.get('/', (_req, res) => ok(res, { labs: listLabs() }));
labRouter.get('/catalog/:id', (req, res) => ok(res, { lab: getLab(String(req.params.id)) }));
labRouter.use(
  a01Router,
  sqliRouter,
  xssRouter,
  csrfRouter,
  ssrfRouter,
  a08Router,
  jwtRouter,
  a06Router,
  a02Router,
  a03Router,
  a09Router,
  a10Router,
  a07Router,
  cryptoRouter
);
