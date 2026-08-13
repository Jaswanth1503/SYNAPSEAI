import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export interface JoinRoomPayload {
  roomName: string;
  userId: string;
  userName?: string;
}

export interface LeaveRoomPayload {
  roomName: string;
  userId: string;
}

export interface CursorMovePayload {
  roomName: string;
  userId: string;
  x: number;
  y: number;
}

export interface DrawEventPayload {
  roomName: string;
  userId: string;
  prevX: number;
  prevY: number;
  currX: number;
  currY: number;
  color: string;
  width: number;
}

export const initStudyRoomGateway = (io: Server) => {
  const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
  const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

  // Only attempt Redis adapter if enabled or explicitly configured
  if (process.env.ENABLE_REDIS_ADAPTER === 'true' || process.env.NODE_ENV === 'production') {
    try {
      const pubClient = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        lazyConnect: true,
        maxRetriesPerRequest: null,
      });

      pubClient.connect().then(() => {
        const subClient = pubClient.duplicate();
        subClient.connect().then(() => {
          io.adapter(createAdapter(pubClient, subClient));
          console.log('[Socket.io] Redis Pub/Sub adapter initialized');
        }).catch((subErr) => {
          console.warn('[Socket.io] SubClient connection warning:', subErr.message);
        });
      }).catch((pubErr) => {
        console.warn('[Socket.io] PubClient connection warning (running single-instance mode):', pubErr.message);
      });
    } catch (adapterErr: any) {
      console.warn('[Socket.io] Redis adapter initialization skipped:', adapterErr.message);
    }
  } else {
    console.log('[Socket.io] Running in local single-instance mode (Redis adapter optional)');
  }

  const studySpaceNamespace = io.of('/study-rooms');

  studySpaceNamespace.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Room Join Event
    socket.on('join-room', (data: JoinRoomPayload) => {
      const { roomName, userId, userName } = data;
      socket.join(roomName);
      console.log(`[Socket.io] ${userId} (${userName || 'Anonymous'}) joined room: ${roomName}`);

      socket.to(roomName).emit('user-joined', {
        userId,
        userName,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Room Leave Event
    socket.on('leave-room', (data: LeaveRoomPayload) => {
      const { roomName, userId } = data;
      socket.leave(roomName);
      console.log(`[Socket.io] ${userId} left room: ${roomName}`);

      socket.to(roomName).emit('user-left', {
        userId,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Cursor Movement Sync
    socket.on('cursor-move', (data: CursorMovePayload) => {
      const { roomName } = data;
      socket.to(roomName).emit('cursor-move', data);
    });

    // Whiteboard Drawing State Sync
    socket.on('draw-event', (data: DrawEventPayload) => {
      const { roomName } = data;
      socket.to(roomName).emit('draw-event', data);
    });

    // Disconnect Event
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};
