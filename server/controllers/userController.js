import mongoose from 'mongoose';
import User from '../models/User.js';

// In-memory fallback users
export let inMemoryUsers = [
  {
    _id: 'usr_admin_1',
    name: 'Alex Chen',
    email: 'alex.chen@campus.edu',
    role: 'Organizer',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_admin_2',
    name: 'Sarah Miller',
    email: 'sarah.miller@campus.edu',
    role: 'Admin',
    createdAt: new Date().toISOString(),
  },
];

// @desc    Get all users
// @route   GET /api/users
// @access  Public
export const getUsers = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    }

    return res.status(200).json({
      success: true,
      count: inMemoryUsers.length,
      data: inMemoryUsers,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const user = await User.findById(id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User not found with id of ${id}`,
        });
      }
      return res.status(200).json({
        success: true,
        data: user,
      });
    }

    const user = inMemoryUsers.find((u) => String(u._id) === String(id));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists',
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role || 'Organizer',
      });

      return res.status(201).json({
        success: true,
        data: user,
      });
    }

    // Fallback: In-memory store
    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || 'Organizer',
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.unshift(newUser);

    return res.status(201).json({
      success: true,
      data: newUser,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};
