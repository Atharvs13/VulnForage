import { Router } from 'express';
import { config } from '../config/index.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';
import { bolaRouter } from '../modules/bola/route.js';
import { sqliRouter } from '../modules/sqli/route.js';
import { login as sqliLogin } from '../modules/sqli/controller.js';
import { xssRouter } from '../modules/xss/route.js';
import { csrfRouter } from '../modules/csrf/route.js';
import { ssrfRouter } from '../modules/ssrf/route.js';
import { fileUploadRouter } from '../modules/file-upload/route.js';
import { jwtRouter } from '../modules/jwt/route.js';
import { businessLogicRouter } from '../modules/business-logic/route.js';
import { misconfigurationRouter } from '../modules/misconfiguration/route.js';

export const labRouter = Router();
labRouter.use((_req, _res, next) => next(config.labMode ? undefined : new AppError(404, 'LAB_DISABLED', 'Lab routes are disabled')));

// Public lab routes
labRouter.post('/sqli/login', sqliLogin);

labRouter.use(requireAuth);
labRouter.use(bolaRouter, sqliRouter, xssRouter, csrfRouter, ssrfRouter, fileUploadRouter, jwtRouter, businessLogicRouter, misconfigurationRouter);
