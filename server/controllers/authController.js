import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token
const generateToken = (userId, role, email) => {
  const jwtSecret = process.env.JWT_SECRET || 'clubops_jwt_secret_dev_key_2026_super_secure';
  return jwt.sign({ id: userId, role, email }, jwtSecret, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user account
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full Name is required',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists in database
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Normalize role if provided
    let normalizedRole = 'Organizer';
    if (role) {
      const allowedRoles = ['Organizer', 'Admin', 'Volunteer', 'Member'];
      const matched = allowedRoles.find(r => r.toLowerCase() === String(role).trim().toLowerCase());
      if (matched) {
        normalizedRole = matched;
      }
    }

    // Create user in MongoDB with bcrypt hashed password
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: normalizedRole,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please sign in with your credentials.',
      user,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user with email & password
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a password',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user in MongoDB
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare bcrypt password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role, user.email);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user from token
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate with Google (Demo or Real OAuth)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res, next) => {
  try {
    const email = (req.body?.email || 'alex.chen.google@clubops.org').trim().toLowerCase();
    const name = (req.body?.name || 'Alex Chen (Google)').trim();

    let user = await User.findOne({ email });

    if (!user) {
      // Create user if doesn't exist
      const randomPassword = 'GAuth_' + Math.random().toString(36).slice(-10) + 'A1!';
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: 'Organizer',
      });
    }

    const token = generateToken(user._id, user.role, user.email);

    return res.status(200).json({
      success: true,
      message: 'Google Sign-In successful',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};
