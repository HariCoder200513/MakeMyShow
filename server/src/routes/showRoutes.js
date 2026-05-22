import { Router } from 'express';
import { createShow, createShowSchema, deleteShow, getShowsByMovie, listOwnerShows, showIdSchema, showMovieSchema, updateShow, updateShowSchema } from '../controllers/showController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const showRoutes = Router();

showRoutes.post('/', authMiddleware, roleMiddleware('OWNER'), validate(createShowSchema), asyncHandler(createShow));
showRoutes.get('/owner/all', authMiddleware, roleMiddleware('OWNER'), asyncHandler(listOwnerShows));
showRoutes.put('/:id', authMiddleware, roleMiddleware('OWNER'), validate(updateShowSchema), asyncHandler(updateShow));
showRoutes.delete('/:id', authMiddleware, roleMiddleware('OWNER'), validate(showIdSchema), asyncHandler(deleteShow));
showRoutes.get('/:movieId', validate(showMovieSchema), asyncHandler(getShowsByMovie));
