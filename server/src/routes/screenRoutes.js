import { Router } from 'express';
import { createScreen, createScreenSchema, deleteScreen, listOwnerScreens, screenIdSchema, updateScreen, updateScreenSchema } from '../controllers/screenController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const screenRoutes = Router();

screenRoutes.post('/', authMiddleware, roleMiddleware('OWNER'), validate(createScreenSchema), asyncHandler(createScreen));
screenRoutes.get('/owner', authMiddleware, roleMiddleware('OWNER'), asyncHandler(listOwnerScreens));
screenRoutes.put('/:id', authMiddleware, roleMiddleware('OWNER'), validate(updateScreenSchema), asyncHandler(updateScreen));
screenRoutes.delete('/:id', authMiddleware, roleMiddleware('OWNER'), validate(screenIdSchema), asyncHandler(deleteScreen));
