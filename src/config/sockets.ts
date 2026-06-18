import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './env.js';

let io: Server | null = null;

export function initSockets(server: HttpServer): Server {
  const allowedOrigins = env.ALLOWED_ORIGINS === '*' ? '*' : env.ALLOWED_ORIGINS.split(',');

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 [Socket] Client connected: ${socket.id}`);

    // Room management demonstration
    socket.on('join_channel', (channel: string) => {
      socket.join(channel);
      console.log(`🔌 [Socket] Client ${socket.id} joined channel: ${channel}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Please call initSockets first.');
  }
  return io;
}

// Helper to broadcast messages to a channel/room
export function broadcastToChannel(channel: string, event: string, payload: any): void {
  if (io) {
    io.to(channel).emit(event, payload);
  }
}
