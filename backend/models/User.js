import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@nitj\.ac\.in$/, 'Only @nitj.ac.in institutional emails are allowed'],
    },
    password: { type: String, required: true, minlength: 6 },
    profilePicture: { type: String, default: '' },
    hostel: { type: String, default: '' },
    department: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalTrades: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
