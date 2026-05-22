import { Router } from 'express';
import { z } from 'zod';
import { bookingIdSchema, confirmBooking, confirmBookingSchema, downloadReceipt, lockBookingSeat, lockSeatSchema, myBookings, unlockBookingSeat } from '../controllers/bookingController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSeatState } from '../services/seatLockService.js';

export const bookingRoutes = Router();

bookingRoutes.use(authMiddleware, roleMiddleware('USER'));
bookingRoutes.post('/lock', validate(lockSeatSchema), asyncHandler(lockBookingSeat));
bookingRoutes.post('/unlock', validate(lockSeatSchema), asyncHandler(unlockBookingSeat));
bookingRoutes.post('/confirm', validate(confirmBookingSchema), asyncHandler(confirmBooking));
bookingRoutes.get('/my', asyncHandler(myBookings));
bookingRoutes.get('/:id/receipt', validate(bookingIdSchema), asyncHandler(downloadReceipt));
bookingRoutes.get('/seats/:showId', validate(z.object({ params: z.object({ showId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await getSeatState(req.params.showId));
}));
