import { Server, Socket } from 'socket.io';

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
