import { Router } from 'express';
import { createMovie, createMovieSchema, deleteMovie, getMovie, listMovies, movieIdSchema, updateMovie, updateMovieSchema } from '../controllers/movieController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const movieRoutes = Router();

movieRoutes.get('/', asyncHandler(listMovies));
movieRoutes.get('/:id', validate(movieIdSchema), asyncHandler(getMovie));
movieRoutes.post('/', authMiddleware, roleMiddleware('OWNER'), validate(createMovieSchema), asyncHandler(createMovie));
movieRoutes.put('/:id', authMiddleware, roleMiddleware('OWNER'), validate(updateMovieSchema), asyncHandler(updateMovie));
movieRoutes.delete('/:id', authMiddleware, roleMiddleware('OWNER'), validate(movieIdSchema), asyncHandler(deleteMovie));
