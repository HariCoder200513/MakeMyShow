import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  loginOptions,
  loginOptionsSchema,
  loginVerifySchema,
  registerOptionsSchema,
  registerVerifySchema,
  registrationOptions,
  verifyLoginResponse,
  verifyRegistrationResponse,
  logout
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRoutes = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  message: { error: 'Too many auth requests, please try again later.' }
});

authRoutes.use(authLimiter);

authRoutes.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
authRoutes.post('/register/options', validate(registerOptionsSchema), asyncHandler(registrationOptions));
authRoutes.post('/register/verify', validate(registerVerifySchema), asyncHandler(verifyRegistrationResponse));
authRoutes.post('/login/options', validate(loginOptionsSchema), asyncHandler(loginOptions));
authRoutes.post('/login/verify', validate(loginVerifySchema), asyncHandler(verifyLoginResponse));
authRoutes.post('/logout', logout);
