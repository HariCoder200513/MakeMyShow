import { io } from 'socket.io-client';

export function createSeatSocket() {
  return io(import.meta.env.VITE_API_URL || undefined, {
    withCredentials: true,
    autoConnect: true
  });
}
