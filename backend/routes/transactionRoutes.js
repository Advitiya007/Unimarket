import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createTransaction,
  confirmTransaction,
  getMyTransactions,
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/mine', protect, getMyTransactions);
router.post('/', protect, createTransaction);
router.post('/:id/confirm', protect, confirmTransaction);

export default router;
