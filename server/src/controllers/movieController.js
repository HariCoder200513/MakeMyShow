import { z } from 'zod';
import { prisma } from '../config/db.js';

const movieBody = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  duration: z.coerce.number().int().positive(),
  genre: z.string().trim().min(1),
  language: z.string().trim().min(1),
  posterUrl: z.string().trim().url()
});

export const createMovieSchema = z.object({ body: movieBody });
export const updateMovieSchema = z.object({ params: z.object({ id: z.string().uuid() }), body: movieBody.partial() });
export const movieIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export async function createMovie(req, res) {
  const movie = await prisma.movie.create({ data: { ...req.validated.body, ownerId: req.user.id } });
  res.status(201).json(movie);
}

export async function listMovies(req, res) {
  const search = String(req.query.search || '').trim();
  const city = String(req.query.city || '').trim();
  const movies = await prisma.movie.findMany({
    where: {
      ...(search
        ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { genre: { contains: search, mode: 'insensitive' } }] }
        : {}),
      ...(city ? { shows: { some: { screen: { theater: { city: { equals: city, mode: 'insensitive' } } } } } } : {})
    },
    include: { shows: { select: { id: true } } },
    orderBy: { title: 'asc' }
  });
  res.json(movies);
}

export async function getMovie(req, res) {
  const movie = await prisma.movie.findUnique({ where: { id: req.validated.params.id } });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
}

export async function updateMovie(req, res) {
  const movie = await prisma.movie.findUnique({ where: { id: req.validated.params.id } });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  if (movie.ownerId && movie.ownerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  const updated = await prisma.movie.update({ where: { id: req.validated.params.id }, data: req.validated.body });
  res.json(updated);
}

export async function deleteMovie(req, res) {
  const movie = await prisma.movie.findUnique({ where: { id: req.validated.params.id } });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  if (movie.ownerId && movie.ownerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  const showCount = await prisma.show.count({ where: { movieId: req.validated.params.id } });
  if (showCount > 0) {
    return res.status(409).json({ error: 'Delete shows before deleting this movie' });
  }

  await prisma.movie.delete({ where: { id: req.validated.params.id } });
  res.status(204).send();
}
