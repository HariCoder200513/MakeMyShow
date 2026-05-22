import { Router } from 'express';
import { createTheater, createTheaterSchema, deleteTheater, listOwnerTheaters, listTheaters, theaterIdSchema, updateTheater, updateTheaterSchema } from '../controllers/theaterController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const theaterRoutes = Router();

theaterRoutes.get('/theaters', asyncHandler(listTheaters));
theaterRoutes.post('/theaters', authMiddleware, roleMiddleware('OWNER'), validate(createTheaterSchema), asyncHandler(createTheater));
theaterRoutes.get('/owner/theaters', authMiddleware, roleMiddleware('OWNER'), asyncHandler(listOwnerTheaters));
theaterRoutes.put('/theaters/:id', authMiddleware, roleMiddleware('OWNER'), validate(updateTheaterSchema), asyncHandler(updateTheater));
theaterRoutes.delete('/theaters/:id', authMiddleware, roleMiddleware('OWNER'), validate(theaterIdSchema), asyncHandler(deleteTheater));
