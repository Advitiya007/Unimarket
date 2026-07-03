import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  expressInterest,
  respondToInterest,
  getMyListings,
} from '../controllers/listingController.js';

const router = express.Router();

router.get('/mine/all', protect, getMyListings);
router.get('/', getListings);
router.post('/', protect, upload.array('images', 5), createListing);
router.get('/:id', getListingById);
router.put('/:id', protect, upload.array('images', 5), updateListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/interest', protect, expressInterest);
router.post('/:id/respond', protect, respondToInterest);

export default router;
