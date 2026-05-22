import { Router } from 'express';
import { createOrder, createOrderSchema, verifyPayment, verifyPaymentSchema } from '../controllers/paymentController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const paymentRoutes = Router();

paymentRoutes.use(authMiddleware, roleMiddleware('USER'));
paymentRoutes.post('/create-order', validate(createOrderSchema), asyncHandler(createOrder));
paymentRoutes.post('/verify', validate(verifyPaymentSchema), asyncHandler(verifyPayment));
