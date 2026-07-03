import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: '' },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  },
  { timestamps: true }
);

ratingSchema.index({ reviewer: 1, transaction: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);
