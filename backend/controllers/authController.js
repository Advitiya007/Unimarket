import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const INSTITUTIONAL_DOMAIN = '@nitj.ac.in';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @desc   Register a new student
// @route  POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, rollNumber, email, password, confirmPassword } = req.body;

    if (!name || !rollNumber || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!email.toLowerCase().endsWith(INSTITUTIONAL_DOMAIN)) {
      return res.status(400).json({ message: `Only ${INSTITUTIONAL_DOMAIN} institutional emails are allowed` });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const existingRoll = await User.findOne({ rollNumber });
    if (existingRoll) {
      return res.status(409).json({ message: 'An account with this roll number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      rollNumber,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// @desc   Log in
// @route  POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateToken(user._id),
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
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// @desc   Get current logged-in user
// @route  GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.user);
};
