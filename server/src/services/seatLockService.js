import { prisma } from '../config/db.js';
import { redis } from '../config/redis.js';

const ttlSeconds = 300;

export function seatLockKey(showId, seatId) {
  return `seat:${showId}:${seatId}`;
}

export async function lockSeat({ showId, seatId, userId }) {
  const booked = await prisma.bookingSeat.findFirst({
    where: {
      seatId,
      booking: { showId, status: 'CONFIRMED' }
    }
  });

  if (booked) {
    const error = new Error('Seat is already booked');
    error.status = 409;
    throw error;
  }

  const key = seatLockKey(showId, seatId);
  const result = await redis.set(key, userId, { NX: true, EX: ttlSeconds });
  if (result !== 'OK') {
    const holder = await redis.get(key);
    if (holder === userId) {
      await redis.expire(key, ttlSeconds);
      return { seatId, locked: true, ownedByUser: true };
    }

    const error = new Error('Seat is locked by another user');
    error.status = 409;
    throw error;
  }

  return { seatId, locked: true, ownedByUser: true };
}

export async function unlockSeat({ showId, seatId, userId }) {
  const key = seatLockKey(showId, seatId);
  const holder = await redis.get(key);
  if (holder === userId) {
    await redis.del(key);
    return true;
  }
  return false;
}

export async function getSeatState(showId) {
  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: {
      screen: { include: { seats: { orderBy: [{ row: 'asc' }, { number: 'asc' }] } } },
      bookings: {
        where: { status: 'CONFIRMED' },
        include: { seats: true }
      }
    }
  });

  if (!show) {
    const error = new Error('Show not found');
    error.status = 404;
    throw error;
  }

  const bookedSeatIds = new Set(show.bookings.flatMap((booking) => booking.seats.map((seat) => seat.seatId)));
  const lockedSeatIds = [];

  if (show.screen.seats.length > 0) {
    const keys = show.screen.seats.map((seat) => seatLockKey(showId, seat.id));
    const values = await redis.mGet(keys);
    show.screen.seats.forEach((seat, index) => {
      if (values[index]) lockedSeatIds.push(seat.id);
    });
  }

  return {
    showId,
    seats: show.screen.seats,
    bookedSeatIds: [...bookedSeatIds],
    lockedSeatIds
  };
}

export async function verifyLocks(showId, seatIds, userId) {
  for (const seatId of seatIds) {
    const holder = await redis.get(seatLockKey(showId, seatId));
    if (holder !== userId) {
      const error = new Error('Seat lock expired or belongs to another user');
      error.status = 409;
      throw error;
    }
  }
}

export async function releaseLocks(showId, seatIds) {
  if (!seatIds.length) return;
  await redis.del(seatIds.map((seatId) => seatLockKey(showId, seatId)));
}
