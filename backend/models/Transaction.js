import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerConfirmed: { type: Boolean, default: false },
    buyerConfirmed: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
