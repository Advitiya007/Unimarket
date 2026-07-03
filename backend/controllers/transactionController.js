import Transaction from '../models/Transaction.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import { lockChatForListing } from './chatController.js';
import createNotification from '../utils/createNotification.js';

// @desc   Seller initiates the transaction record once a buyer is selected (Reserved status)
// @route  POST /api/transactions
// body: { listingId }
export const createTransaction = async (req, res) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the seller can start a transaction' });
    }
    if (!listing.selectedBuyer) {
      return res.status(400).json({ message: 'No buyer has been accepted for this listing yet' });
    }

    let transaction = await Transaction.findOne({ listing: listingId, completed: false });
    if (!transaction) {
      transaction = await Transaction.create({
        listing: listingId,
        seller: listing.seller,
        buyer: listing.selectedBuyer,
      });
    }

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create transaction', error: err.message });
  }
};

// @desc   Seller confirms "Delivered" or buyer confirms "Received"
// @route  POST /api/transactions/:id/confirm
export const confirmTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('listing');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const isSeller = transaction.seller.toString() === req.user._id.toString();
    const isBuyer = transaction.buyer.toString() === req.user._id.toString();
    if (!isSeller && !isBuyer) {
      return res.status(403).json({ message: 'You are not part of this transaction' });
    }

    if (isSeller) transaction.sellerConfirmed = true;
    if (isBuyer) transaction.buyerConfirmed = true;

    if (transaction.sellerConfirmed && transaction.buyerConfirmed && !transaction.completed) {
      transaction.completed = true;
      transaction.completedAt = new Date();

      const listing = await Listing.findById(transaction.listing._id);
      listing.status = 'Sold';
      await listing.save();
      await lockChatForListing(listing._id);

      await User.findByIdAndUpdate(transaction.seller, { $inc: { totalTrades: 1 } });
      await User.findByIdAndUpdate(transaction.buyer, { $inc: { totalTrades: 1 } });

      await createNotification(req.io, {
        user: transaction.seller,
        message: `Transaction for "${listing.title}" is complete. You can now rate the buyer.`,
        type: 'sold',
        link: `/transactions/${transaction._id}/rate`,
      });
      await createNotification(req.io, {
        user: transaction.buyer,
        message: `Transaction for "${listing.title}" is complete. You can now rate the seller.`,
        type: 'sold',
        link: `/transactions/${transaction._id}/rate`,
      });
    }

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to confirm transaction', error: err.message });
  }
};

// @desc   Get transactions for logged-in user
// @route  GET /api/transactions/mine
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ seller: req.user._id }, { buyer: req.user._id }],
    })
      .populate('listing', 'title images price')
      .populate('seller', 'name profilePicture')
      .populate('buyer', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
};
