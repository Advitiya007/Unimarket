import Rating from '../models/Rating.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import createNotification from '../utils/createNotification.js';

// @desc   Submit a rating for the counterpart of a completed transaction
// @route  POST /api/ratings
export const createRating = async (req, res) => {
  try {
    const { transactionId, stars, review } = req.body;
    if (!transactionId || !stars) {
      return res.status(400).json({ message: 'transactionId and stars are required' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (!transaction.completed) {
      return res.status(400).json({ message: 'Rating unlocks only after the transaction is complete' });
    }

    const isSeller = transaction.seller.toString() === req.user._id.toString();
    const isBuyer = transaction.buyer.toString() === req.user._id.toString();
    if (!isSeller && !isBuyer) {
      return res.status(403).json({ message: 'You are not part of this transaction' });
    }

    const reviewedUser = isSeller ? transaction.buyer : transaction.seller;

    const rating = await Rating.create({
      reviewer: req.user._id,
      reviewedUser,
      stars,
      review: review || '',
      transaction: transactionId,
    });

    const allRatings = await Rating.find({ reviewedUser });
    const avg = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;
    await User.findByIdAndUpdate(reviewedUser, { rating: avg, ratingCount: allRatings.length });

    await createNotification(req.io, {
      user: reviewedUser,
      message: `${req.user.name} left you a ${stars}-star rating`,
      type: 'rating',
      link: `/profile`,
    });

    res.status(201).json(rating);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already rated this transaction' });
    }
    res.status(500).json({ message: 'Failed to submit rating', error: err.message });
  }
};

// @desc   Get ratings received by a user
// @route  GET /api/ratings/user/:userId
export const getRatingsForUser = async (req, res) => {
  try {
    const ratings = await Rating.find({ reviewedUser: req.params.userId })
      .populate('reviewer', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ratings', error: err.message });
  }
};
