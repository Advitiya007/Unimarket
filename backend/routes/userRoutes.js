import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUserProfile,
  updateProfile,
  toggleWishlist,
  getWishlist,
  getNotifications,
  markNotificationRead,
} from '../controllers/userController.js';

const router = express.Router();

router.put('/me', protect, updateProfile);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:listingId', protect, toggleWishlist);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.get('/:id', getUserProfile);

export default router;
