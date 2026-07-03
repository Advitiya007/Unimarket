import Chat from '../models/Chat.js';

// @desc   Get all chats for logged-in user
// @route  GET /api/chats
export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name profilePicture')
      .populate('listing', 'title images price status')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chats', error: err.message });
  }
};

// @desc   Get one chat (only participants can view)
// @route  GET /api/chats/:id
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name profilePicture')
      .populate('listing', 'title images price status seller')
      .populate('messages.sender', 'name profilePicture');

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isParticipant = chat.participants.some((p) => p._id.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'You are not part of this chat' });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat', error: err.message });
  }
};

// @desc   Send a message (REST fallback; primary path is socket.io)
// @route  POST /api/chats/:id/messages
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isParticipant = chat.participants.some((p) => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'You are not part of this chat' });
    if (!chat.active) return res.status(400).json({ message: 'This chat is locked and read-only' });

    const message = { sender: req.user._id, text: text || '', image: image || '', readBy: [req.user._id] };
    chat.messages.push(message);
    await chat.save();

    const populated = await chat.populate('messages.sender', 'name profilePicture');
    const newMessage = populated.messages[populated.messages.length - 1];
console.log(`New message sent in chat ${chat._id}:`, newMessage);
    if (req.io) {
      req.io.to(`chat:${chat._id}`).emit('message:new', { chatId: chat._id, message: newMessage });
    }

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// Locks a chat (called internally when listing becomes Sold/Expired)
export const lockChatForListing = async (listingId) => {
  await Chat.updateMany({ listing: listingId }, { active: false });
};
