import { z } from 'zod';
import { prisma } from '../config/db.js';

export const createScreenSchema = z.object({
  body: z.object({
    theaterId: z.string().uuid(),
    name: z.string().trim().min(1),
    rows: z.coerce.number().int().min(1).max(26),
    seatsPerRow: z.coerce.number().int().min(1).max(30),
    type: z.enum(['REGULAR', 'PREMIUM', 'RECLINER']).default('REGULAR'),
    price: z.coerce.number().int().positive()
  })
});

export const screenIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const updateScreenSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().trim().min(1).optional()
  })
});

export async function createScreen(req, res) {
  const { theaterId, name, rows, seatsPerRow, type, price } = req.validated.body;
  const theater = await prisma.theater.findFirst({ where: { id: theaterId, ownerId: req.user.id } });
  if (!theater) return res.status(404).json({ error: 'Owned theater not found' });

  const screen = await prisma.screen.create({
    data: {
      name,
      theaterId,
      seats: {
        create: Array.from({ length: rows }).flatMap((_, rowIndex) => {
          const row = String.fromCharCode(65 + rowIndex);
          return Array.from({ length: seatsPerRow }).map((__, seatIndex) => ({
            row,
            number: seatIndex + 1,
            type,
            price
          }));
        })
      }
    },
    include: { seats: true }
  });

  res.status(201).json(screen);
}

export async function listOwnerScreens(req, res) {
  const screens = await prisma.screen.findMany({
    where: { theater: { ownerId: req.user.id } },
    include: {
      theater: true,
      seats: true,
      shows: { include: { movie: true } }
    },
    orderBy: [{ theater: { name: 'asc' } }, { name: 'asc' }]
  });
  res.json(screens);
}

export async function updateScreen(req, res) {
  const screen = await prisma.screen.findFirst({
    where: { id: req.validated.params.id, theater: { ownerId: req.user.id } }
  });
  if (!screen) return res.status(404).json({ error: 'Owned screen not found' });

  const updated = await prisma.screen.update({
    where: { id: screen.id },
    data: req.validated.body
  });
  res.json(updated);
}

export async function deleteScreen(req, res) {
  const screen = await prisma.screen.findFirst({
    where: { id: req.validated.params.id, theater: { ownerId: req.user.id } },
    include: { shows: true }
  });
  if (!screen) return res.status(404).json({ error: 'Owned screen not found' });
  if (screen.shows.length > 0) return res.status(409).json({ error: 'Delete shows before deleting this screen' });

  await prisma.screen.delete({ where: { id: screen.id } });
  res.status(204).send();
}
