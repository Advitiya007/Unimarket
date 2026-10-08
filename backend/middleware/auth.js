import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verifies JWT and attaches the authenticated user to req.user
export const protect = async (req, res, next) => {
  try {
    // CHANGED: JWT is now stored in an HttpOnly cookie,
    // so we read it from req.cookies instead of Authorization header.
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token provided',
      });
    }

    // CHANGED: Verify the token we retrieved from the cookie.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'Not authorized, user not found',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        message: 'Your account has been suspended',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Not authorized, invalid or expired token',
    });
  }
};


// Restricts a route to admin users only
export const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      message: 'Admin access required',
    });
  }

  next();
};
