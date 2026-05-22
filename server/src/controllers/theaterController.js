import { z } from 'zod';
import { prisma } from '../config/db.js';

export const createTheaterSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    city: z.string().trim().min(1)
  })
});

export const theaterIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const updateTheaterSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional()
  })
});

export async function createTheater(req, res) {
  const theater = await prisma.theater.create({
    data: { ...req.validated.body, ownerId: req.user.id }
  });
  res.status(201).json(theater);
}

export async function listTheaters(req, res) {
  const city = String(req.query.city || '').trim();
  const theaters = await prisma.theater.findMany({
    where: city ? { city: { equals: city, mode: 'insensitive' } } : {},
    include: { screens: true },
    orderBy: [{ city: 'asc' }, { name: 'asc' }]
  });
  res.json(theaters);
}

export async function listOwnerTheaters(req, res) {
  const theaters = await prisma.theater.findMany({
    where: { ownerId: req.user.id },
    include: { screens: { include: { seats: true, shows: { include: { movie: true } } } } },
    orderBy: { name: 'asc' }
  });
  res.json(theaters);
}

export async function updateTheater(req, res) {
  const theater = await prisma.theater.findFirst({
    where: { id: req.validated.params.id, ownerId: req.user.id }
  });
  if (!theater) return res.status(404).json({ error: 'Owned theater not found' });

  const updated = await prisma.theater.update({
    where: { id: theater.id },
    data: req.validated.body
  });
  res.json(updated);
}

export async function deleteTheater(req, res) {
  const theater = await prisma.theater.findFirst({
    where: { id: req.validated.params.id, ownerId: req.user.id },
    include: { screens: { include: { shows: true } } }
  });
  if (!theater) return res.status(404).json({ error: 'Owned theater not found' });

  const hasShows = theater.screens.some((screen) => screen.shows.length > 0);
  if (hasShows) {
    return res.status(409).json({ error: 'Delete shows before deleting this theater' });
  }

  await prisma.theater.delete({ where: { id: theater.id } });
  res.status(204).send();
}
