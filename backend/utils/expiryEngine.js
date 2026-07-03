import Listing from '../models/Listing.js';
import { lockChatForListing } from '../controllers/chatController.js';

// Marks any Available listing past its expiresAt as Expired.
// Runs on a timer (see server.js) instead of a separate cron package to keep
// deployment simple; swap for node-cron if finer scheduling is needed.
const runExpiryEngine = async () => {
  try {
    const now = new Date();
    const expired = await Listing.find({ status: 'Available', expiresAt: { $lte: now } });

    for (const listing of expired) {
      listing.status = 'Expired';
      await listing.save();
      await lockChatForListing(listing._id);
    }

    if (expired.length > 0) {
      console.log(`Expiry engine: archived ${expired.length} listing(s)`);
    }
  } catch (err) {
    console.error('Expiry engine error:', err.message);
  }
};

export default runExpiryEngine;
