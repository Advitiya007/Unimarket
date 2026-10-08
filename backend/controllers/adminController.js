import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Transaction from '../models/Transaction.js';

export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};

// extract the document with the _id passed thru route paarmeteres /api/users/:id
//isusupended:true ==> defiens te fields to modify $set : issuspendeD: true doesnt overwrite othe rfields 
export const suspendUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: true }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// - reduces the new response 's password 
export const unsuspendUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: false }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

export const deleteListingAdmin = async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  res.json({ message: 'Listing removed' });
};

export const getAllListingsAdmin = async (req, res) => {
  const listings = await Listing.find().populate('seller', 'name',' email').sort({ createdAt: -1 });
  res.json(listings);
};

export const getAllTransactionsAdmin = async (req, res) => {
  const transactions = await Transaction.find()
    .populate('listing', 'title price')
    .populate('seller', 'name email')
    .populate('buyer', 'name email')
    .sort({ createdAt: -1 });
  res.json(transactions);
};
