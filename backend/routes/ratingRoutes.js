import express from 'express';
import { protect } from '../middleware/auth.js';
import { createRating, getRatingsForUser } from '../controllers/ratingController.js';

const router = express.Router();

router.post('/', protect, createRating);
router.get('/user/:userId', protect, getRatingsForUser);

export default router;
