import { env } from '../config/env.js';
import { redis } from '../config/redis.js';
import { lockSeat, seatLockKey, unlockSeat } from '../services/seatLockService.js';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export function registerSeatSocket(io) {
  io.use((socket, next) => {
    const cookies = cookie.parse(socket.request.headers.cookie || '');
    const token = cookies.token || socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, env.jwtSecret);
      socket.user = { id: payload.sub, role: payload.role };
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('joinShow', ({ showId }) => {
      if (showId) socket.join(`show:${showId}`);
    });

    socket.on('lockSeat', async ({ showId, seatId }, callback) => {
      try {
        await lockSeat({ showId, seatId, userId: socket.user.id });
        io.to(`show:${showId}`).emit('seatLocked', { showId, seatId });
        setTimeout(async () => {
          try {
            const holder = await redis.get(seatLockKey(showId, seatId));
            if (!holder) io.to(`show:${showId}`).emit('seatUnlocked', { showId, seatId });
          } catch (err) {
            console.error('Failed to check seat lock expiry in socket:', err);
          }
        }, 300_000);
        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, error: error.message });
      }
    });

    socket.on('unlockSeat', async ({ showId, seatId }, callback) => {
      try {
        const unlocked = await unlockSeat({ showId, seatId, userId: socket.user.id });
        if (unlocked) io.to(`show:${showId}`).emit('seatUnlocked', { showId, seatId });
        callback?.({ ok: true, unlocked });
      } catch (error) {
        callback?.({ ok: false, error: error.message });
      }
    });
  });
}
