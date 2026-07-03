import Notification from '../models/Notification.js';

// Creates a notification in the DB and, if a socket.io instance is available,
// pushes it live to the user's personal room.
const createNotification = async (io, { user, message, type = 'system', link = '' }) => {
  const notification = await Notification.create({ user, message, type, link });
  if (io) {
    io.to(`user:${user}`).emit('notification:new', notification);
  }
  return notification;
};

export default createNotification;
