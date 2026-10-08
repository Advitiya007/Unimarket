import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';

// Tracks which users are currently online (userId -> socket count)
const onlineUsers = new Map();

const socketHandler = (io) => {
  // Authenticate every socket connection using the same JWT used for REST
  io.use((socket, next) => {
    try {
      const token = socket.handshake.headers.cookie
        ?.split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('token='))
        ?.slice('token='.length);
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    socket.join(`user:${userId}`);

    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
    io.emit('presence:online', { userId, online: true });

    socket.on('chat:join', async ({ chatId }) => {
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      const isParticipant = chat.participants.some((p) => p.toString() === userId);
      if (!isParticipant) return;
      socket.join(`chat:${chatId}`);
    });

    socket.on('chat:leave', ({ chatId }) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('message:send', async ({ chatId, text, image }) => {
      const chat = await Chat.findById(chatId);
      if (!chat) return socket.emit('error:message', { message: 'Chat not found' });

      const isParticipant = chat.participants.some((p) => p.toString() === userId);
      if (!isParticipant) return socket.emit('error:message', { message: 'Not a participant of this chat' });
      if (!chat.active) return socket.emit('error:message', { message: 'This chat is locked and read-only' });

      chat.messages.push({ sender: userId, text: text || '', image: image || '', readBy: [userId] });
      await chat.save();

      const populated = await chat.populate('messages.sender', 'name profilePicture');
      const newMessage = populated.messages[populated.messages.length - 1];

      io.to(`chat:${chatId}`).emit('message:new', { chatId, message: newMessage });
    });

    socket.on('typing:start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:start', { chatId, userId });
    });
    socket.on('typing:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', { chatId, userId });
    });

    socket.on('message:read', async ({ chatId }) => {
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      chat.messages.forEach((m) => {
        if (!m.readBy.some((id) => id.toString() === userId)) m.readBy.push(userId);
      });
      await chat.save();
      io.to(`chat:${chatId}`).emit('message:readAck', { chatId, userId });
    });

    socket.on('disconnect', () => {
      const count = (onlineUsers.get(userId) || 1) - 1;
      if (count <= 0) {
        onlineUsers.delete(userId);
        io.emit('presence:online', { userId, online: false });
      } else {
        onlineUsers.set(userId, count);
      }
    });
  });
};

export default socketHandler;
