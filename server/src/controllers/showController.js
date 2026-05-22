import { z } from 'zod';
import { prisma } from '../config/db.js';

export const createShowSchema = z.object({
  body: z.object({
    movieId: z.string().uuid(),
    screenId: z.string().uuid(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date()
  })
});

export const showIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const updateShowSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    movieId: z.string().uuid().optional(),
    screenId: z.string().uuid().optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional()
  })
});

export const showMovieSchema = z.object({
  params: z.object({ movieId: z.string().uuid() }),
  query: z.object({ city: z.string().optional() })
});

export async function createShow(req, res) {
  const { movieId, screenId, startTime, endTime } = req.validated.body;
  if (endTime <= startTime) return res.status(400).json({ error: 'End time must be after start time' });

  const screen = await prisma.screen.findFirst({
    where: { id: screenId, theater: { ownerId: req.user.id } }
  });
  if (!screen) return res.status(404).json({ error: 'Owned screen not found' });

  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  const show = await prisma.show.create({ data: { movieId, screenId, startTime, endTime } });
  res.status(201).json(show);
}

export async function getShowsByMovie(req, res) {
  const city = req.validated.query.city?.trim();
  const shows = await prisma.show.findMany({
    where: {
      movieId: req.validated.params.movieId,
      ...(city ? { screen: { theater: { city: { equals: city, mode: 'insensitive' } } } } : {})
    },
    include: { movie: true, screen: { include: { theater: true } } },
    orderBy: { startTime: 'asc' }
  });
  res.json(shows);
}

export async function listOwnerShows(req, res) {
  const shows = await prisma.show.findMany({
    where: { screen: { theater: { ownerId: req.user.id } } },
    include: { movie: true, screen: { include: { theater: true } }, bookings: true },
    orderBy: { startTime: 'asc' }
  });
  res.json(shows);
}

export async function updateShow(req, res) {
  const current = await prisma.show.findFirst({
    where: { id: req.validated.params.id, screen: { theater: { ownerId: req.user.id } } }
  });
  if (!current) return res.status(404).json({ error: 'Owned show not found' });

  const nextScreenId = req.validated.body.screenId || current.screenId;
  const screen = await prisma.screen.findFirst({
    where: { id: nextScreenId, theater: { ownerId: req.user.id } }
  });
  if (!screen) return res.status(404).json({ error: 'Owned screen not found' });

  if (req.validated.body.movieId) {
    const movie = await prisma.movie.findUnique({ where: { id: req.validated.body.movieId } });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
  }

  const startTime = req.validated.body.startTime || current.startTime;
  const endTime = req.validated.body.endTime || current.endTime;
  if (endTime <= startTime) return res.status(400).json({ error: 'End time must be after start time' });

  const updated = await prisma.show.update({
    where: { id: current.id },
    data: req.validated.body,
    include: { movie: true, screen: { include: { theater: true } }, bookings: true }
  });
  res.json(updated);
}

export async function deleteShow(req, res) {
  const show = await prisma.show.findFirst({
    where: { id: req.validated.params.id, screen: { theater: { ownerId: req.user.id } } },
    include: { bookings: true }
  });
  if (!show) return res.status(404).json({ error: 'Owned show not found' });
  if (show.bookings.length > 0) return res.status(409).json({ error: 'Cannot delete a show with bookings' });

  await prisma.show.delete({ where: { id: show.id } });
  res.status(204).send();
}
