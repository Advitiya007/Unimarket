import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMyChats, getChatById, sendMessage } from '../controllers/chatController.js';

const router = express.Router();

router.get('/', protect, getMyChats);
router.get('/:id', protect, getChatById);
router.post('/:id/messages', protect, sendMessage);

export default router;
