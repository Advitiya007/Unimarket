import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Books',
        'Electronics',
        'Cycles',
        'Furniture',
        'Hostel Essentials',
        'Lab Equipment',
        'Sports',
        'Stationery',
        'Clothing',
        'Lost & Found',
      ],
    },
    price: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Used'],
    },
    brand: { type: String, default: '' },
    images: [{ type: String }],
    meetupLocation: {
      type: String,
      required: true,
      enum: [
        'Boys Hostel',
        'Girls Hostel',
        'Mega Canteen',
        'Central Library',
        'Academic Block',
        'Main Gate',
        'SAC',
        'Sports Complex',
        'Other',
      ],
    },
    meetupNotes: { type: String, default: '' },
    interestedBuyers: [
      {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
    selectedBuyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold', 'Expired'],
      default: 'Available',
    },
    views: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Listing', listingSchema);
