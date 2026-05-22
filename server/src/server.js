import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectRedis, redis } from './config/redis.js';
import { registerSeatSocket } from './sockets/seatSocket.js';
import { prisma } from './config/db.js';

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.clientOrigin, credentials: true }
});

app.set('io', io);
registerSeatSocket(io);

await connectRedis();

server.listen(env.port, () => {
  console.log(`Movie booking API listening on http://localhost:${env.port}`);
});

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  server.close();
  await prisma.$disconnect();
  if (redis.isOpen) await redis.quit();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
