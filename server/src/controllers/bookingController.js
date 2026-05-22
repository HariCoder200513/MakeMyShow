import { z } from 'zod';
import QRCode from 'qrcode';
import { prisma } from '../config/db.js';
import { redis } from '../config/redis.js';
import { lockSeat, releaseLocks, seatLockKey, unlockSeat, verifyLocks } from '../services/seatLockService.js';
import { createReceiptPdf } from '../services/receiptService.js';

export const lockSeatSchema = z.object({
  body: z.object({
    showId: z.string().uuid(),
    seatId: z.string().uuid()
  })
});

export const confirmBookingSchema = z.object({
  body: z.object({
    showId: z.string().uuid(),
    seatIds: z.array(z.string().uuid()).min(1),
    paymentId: z.string().trim().min(1)
  })
});

export const bookingIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

async function buildQrCode(booking) {
  const payload = {
    bookingId: booking.id,
    movie: booking.show.movie.title,
    theater: booking.show.screen.theater.name,
    seats: booking.seats.map(({ seat }) => `${seat.row}${seat.number}`),
    showTiming: booking.show.startTime
  };

  return QRCode.toDataURL(JSON.stringify(payload));
}

export async function lockBookingSeat(req, res) {
  const { showId, seatId } = req.validated.body;
  const result = await lockSeat({ showId, seatId, userId: req.user.id });
  req.app.get('io')?.to(`show:${showId}`).emit('seatLocked', { showId, seatId });
  setTimeout(async () => {
    try {
      const holder = await redis.get(seatLockKey(showId, seatId));
      if (!holder) req.app.get('io')?.to(`show:${showId}`).emit('seatUnlocked', { showId, seatId });
    } catch (err) {
      console.error('Failed to check seat lock expiry:', err);
    }
  }, 300_000);
  res.json(result);
}

export async function unlockBookingSeat(req, res) {
  const { showId, seatId } = req.validated.body;
  const unlocked = await unlockSeat({ showId, seatId, userId: req.user.id });
  if (unlocked) req.app.get('io')?.to(`show:${showId}`).emit('seatUnlocked', { showId, seatId });
  res.json({ unlocked });
}

export async function confirmBooking(req, res) {
  const { showId, seatIds, paymentId } = req.validated.body;
  await verifyLocks(showId, seatIds, req.user.id);

  const seats = await prisma.seat.findMany({
    where: { id: { in: seatIds }, screen: { shows: { some: { id: showId } } } }
  });

  if (seats.length !== seatIds.length) {
    return res.status(400).json({ error: 'Invalid seats for this show' });
  }

  let booking;

  try {
    booking = await prisma.$transaction(async (tx) => {
      const booked = await tx.bookingSeat.findFirst({
        where: { showId, seatId: { in: seatIds } }
      });

      if (booked) {
        const error = new Error('One or more seats are already booked');
        error.status = 409;
        throw error;
      }

      return tx.booking.create({
        data: {
          userId: req.user.id,
          showId,
          totalAmount: seats.reduce((sum, seat) => sum + seat.price, 0),
          status: 'CONFIRMED',
          paymentId,
          seats: { create: seatIds.map((seatId) => ({ seatId, showId })) }
        },
        include: {
          show: { include: { movie: true, screen: { include: { theater: true } } } },
          seats: { include: { seat: true } }
        }
      });
    }, { maxWait: 10_000, timeout: 15_000, isolationLevel: 'Serializable' });
  } catch (error) {
    await releaseLocks(showId, seatIds);
    for (const seatId of seatIds) {
      req.app.get('io')?.to(`show:${showId}`).emit('seatUnlocked', { showId, seatId });
    }
    if (error.code === 'P2002' || error.status === 409) {
      return res.status(409).json({ error: 'One or more seats are already booked' });
    }
    throw error;
  }

  const qrCode = await buildQrCode(booking);
  const saved = await prisma.booking.update({
    where: { id: booking.id },
    data: { qrCode },
    include: {
      show: { include: { movie: true, screen: { include: { theater: true } } } },
      seats: { include: { seat: true } }
    }
  });

  await releaseLocks(showId, seatIds);
  for (const seatId of seatIds) {
    req.app.get('io')?.to(`show:${showId}`).emit('seatUnlocked', { showId, seatId });
  }
  req.app.get('io')?.to(`show:${showId}`).emit('seatsBooked', { showId, seatIds });

  res.status(201).json(saved);
}

export async function myBookings(req, res) {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    include: {
      show: { include: { movie: true, screen: { include: { theater: true } } } },
      seats: { include: { seat: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(bookings);
}

export async function downloadReceipt(req, res) {
  const booking = await prisma.booking.findFirst({
    where: { id: req.validated.params.id, userId: req.user.id },
    include: {
      show: { include: { movie: true, screen: { include: { theater: true } } } },
      seats: { include: { seat: true } }
    }
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const pdf = await createReceiptPdf(booking);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="ticket-${booking.id}.pdf"`);
  res.send(pdf);
}
