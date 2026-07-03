import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Notification from '../models/Notification.js';

// @desc   Get a public profile
// @route  GET /api/users/:id
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const activeListings = await Listing.find({ seller: user._id, status: 'Available' });
    const soldListings = await Listing.find({ seller: user._id, status: 'Sold' });

    res.json({ user, activeListings, soldListings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

// @desc   Update own profile
// @route  PUT /api/users/me
export const updateProfile = async (req, res) => {
  try {
    const editable = ['name', 'hostel', 'department', 'profilePicture'];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// @desc   Toggle a listing in the user's wishlist
// @route  POST /api/users/wishlist/:listingId
export const toggleWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;
    const user = req.user;
    const index = user.wishlist.findIndex((id) => id.toString() === listingId);
    if (index === -1) {
      user.wishlist.push(listingId);
    } else {
      user.wishlist.splice(index, 1);
    }
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update wishlist', error: err.message });
  }
};

// @desc   Get logged-in user's wishlist listings
// @route  GET /api/users/wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'seller', select: 'name rating' },
    });
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error: err.message });
  }
};

// @desc   Get logged-in user's notifications
// @route  GET /api/users/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

// @desc   Mark a notification as read
// @route  PUT /api/users/notifications/:id/read
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification', error: err.message });
  }
};
