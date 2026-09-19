import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { inMemoryUsers } from './userController.js';

// Helper to generate JWT token
const generateToken = (userId, role, email) => {
  const jwtSecret = process.env.JWT_SECRET || 'clubops_jwt_secret_dev_key_2026_super_secure';
  return jwt.sign({ id: userId, role, email }, jwtSecret, {
    expiresIn: '7d',
  });
};

// Ensure default demo organizer exists in memory
if (!inMemoryUsers.some((u) => u.email === 'alex.chen@clubops.org')) {
  inMemoryUsers.unshift({
    _id: 'usr_demo_organizer',
    name: 'Alex Chen',
    email: 'alex.chen@clubops.org',
    password: '$2a$10$wN9v4s91FmG40Oq53f6HauY3R9m/d9qV9YQ7pW9i8e4e7e6w1d2q3', // Password123!
    plainPassword: 'Password123!',
    role: 'Organizer',
    createdAt: new Date().toISOString(),
  });
}

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

    // Normalize role if provided
    let normalizedRole = 'Organizer';
    if (role) {
      const allowedRoles = ['Organizer', 'Admin', 'Volunteer', 'Member'];
      const matched = allowedRoles.find(
        (r) => r.toLowerCase() === String(role).trim().toLowerCase()
      );
      if (matched) {
        normalizedRole = matched;
      }
    }

    // 1. If MongoDB is connected, use real MongoDB
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

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
        data: { user },
      });
    }

    // 2. Offline / In-memory fallback
    const existingMemUser = inMemoryUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (existingMemUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newMemUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      plainPassword: password,
      role: normalizedRole,
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.unshift(newMemUser);

    const safeUser = {
      _id: newMemUser._id,
      name: newMemUser.name,
      email: newMemUser.email,
      role: newMemUser.role,
      createdAt: newMemUser.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please sign in with your credentials.',
      user: safeUser,
      data: { user: safeUser },
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

    // 1. If MongoDB is connected, use real MongoDB
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(user._id, user.role, user.email);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user,
      });
    }

    // 2. Offline / In-memory fallback
    const memUser = inMemoryUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!memUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    let isMatch = false;
    if (memUser.plainPassword && memUser.plainPassword === password) {
      isMatch = true;
    } else if (memUser.password) {
      if (memUser.password.startsWith('$2a$') || memUser.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, memUser.password);
      } else {
        isMatch = memUser.password === password;
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const safeUser = {
      _id: memUser._id,
      name: memUser.name,
      email: memUser.email,
      role: memUser.role,
      createdAt: memUser.createdAt,
    };

    const token = generateToken(memUser._id, memUser.role, memUser.email);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser,
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

    // 1. If MongoDB is connected, use real MongoDB
    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email });

      if (!user) {
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
    }

    // 2. Offline / In-memory fallback
    let memUser = inMemoryUsers.find((u) => u.email.toLowerCase() === email);
    if (!memUser) {
      memUser = {
        _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name,
        email,
        role: 'Organizer',
        createdAt: new Date().toISOString(),
      };
      inMemoryUsers.unshift(memUser);
    }

    const safeUser = {
      _id: memUser._id,
      name: memUser.name,
      email: memUser.email,
      role: memUser.role,
      createdAt: memUser.createdAt,
    };

    const token = generateToken(memUser._id, memUser.role, memUser.email);

    return res.status(200).json({
      success: true,
      message: 'Google Sign-In successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

