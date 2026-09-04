import { Router } from 'express';
import { loginController, logoutController, meController, registerController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();
authRouter.post('/register', registerController);
authRouter.post('/login', loginController);
authRouter.post('/logout', requireAuth, logoutController);
authRouter.get('/me', requireAuth, meController);
