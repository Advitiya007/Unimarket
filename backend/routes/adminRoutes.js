import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getAllUsers,
  suspendUser,
  unsuspendUser,
  deleteListingAdmin,
  getAllListingsAdmin,
  getAllTransactionsAdmin,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/unsuspend', unsuspendUser);
router.get('/listings', getAllListingsAdmin);
router.delete('/listings/:id', deleteListingAdmin);
router.get('/transactions', getAllTransactionsAdmin);

export default router;
