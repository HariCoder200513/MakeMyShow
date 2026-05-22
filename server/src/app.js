import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { authRoutes } from './routes/authRoutes.js';
import { movieRoutes } from './routes/movieRoutes.js';
import { theaterRoutes } from './routes/theaterRoutes.js';
import { screenRoutes } from './routes/screenRoutes.js';
import { showRoutes } from './routes/showRoutes.js';
import { bookingRoutes } from './routes/bookingRoutes.js';
import { paymentRoutes } from './routes/paymentRoutes.js';
import { errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '../../client/dist');

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/auth', authRoutes);
  app.use('/movies', movieRoutes);
  app.use(theaterRoutes);
  app.use('/screens', screenRoutes);
  app.use('/shows', showRoutes);
  app.use('/bookings', bookingRoutes);
  app.use('/payments', paymentRoutes);

  app.use(errorHandler);

  // In production, serve the built React client
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  return app;
}
