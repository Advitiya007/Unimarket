import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const INSTITUTIONAL_DOMAIN = '@nitj.ac.in';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// CHANGED: Centralized cookie options so register/login/logout
// all use exactly the same cookie configuration.
const cookieOptions = {
  httpOnly: true, // CHANGED: JavaScript cannot access the JWT
  secure: process.env.NODE_ENV === 'production', // CHANGED: HTTPS in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CHANGED
  maxAge: 7 * 24 * 60 * 60 * 1000, // CHANGED: 7 days
};

// @desc   Register a new student
// @route  POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, rollNumber, email, password, confirmPassword } = req.body;

    if (!name || !rollNumber || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }
console.log(`Registering user: ${name}, Roll Number: ${rollNumber}, Email: ${email}`);
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.endsWith(INSTITUTIONAL_DOMAIN)) {
      return res.status(400).json({
        message: 'Only institutional emails are allowed',
      });
    }

    // Roll number must be exactly 8 digits
    if (!/^\d{8}$/.test(rollNumber)) {
      return res.status(400).json({
        message: 'Incorrect roll number or email',
      });
    }

    // Extract 2 digits before @

    const emailYearMatch = normalizedEmail.match(/\.([0-9]{2})@/);

    if (!emailYearMatch) {
      return res.status(400).json({
        message: 'Invalid institutional email format',
      });
    }

    const emailYear = emailYearMatch[1];

    // First 2 digits of roll number must match email year
    if (rollNumber.substring(0, 2) !== emailYear) {
      return res.status(400).json({
        message: 'Incorrect roll number or email',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        message: 'An account with this email already exists',
      });
    }

    const existingRoll = await User.findOne({
      rollNumber,
    });

    if (existingRoll) {
      return res.status(409).json({
        message: 'An account with this roll number already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      rollNumber,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'Registration failed',
      error:
        process.env.NODE_ENV === 'production'
          ? undefined
          : err.message,
    });
  }
};

// @desc   Log in
// @route  POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        message: 'Your account has been suspended. Contact admin.',
      });
    }
console.log
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }
    console.log(`User logged in: ${user.name}, Email: ${user.email}`);

    // CHANGED: Generate JWT and put it in HttpOnly cookie.
    const token = generateToken(user._id);

    // CHANGED: No need for localStorage/sessionStorage.
    res.cookie('token', token, cookieOptions);

    res.json({
      // CHANGED: token removed from response
      user: {
        _id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'Login failed',
      // CHANGED: Don't expose internal error details in production.
      error:
        process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
};

// @desc   Log out
// @route  POST /api/auth/logout
export const logout = async (req, res) => {
  // CHANGED: Clear the JWT cookie when the user logs out.
  res.clearCookie('token', cookieOptions);

  res.json({
    message: 'Logged out successfully',
  });
};

// @desc   Get current logged-in user
// @route  GET /api/auth/me
export const getMe = async (req, res) => {
  console.log('getMe called, req.user:', req.user);
  res.json(req.user);
};