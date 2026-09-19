import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { inMemoryUsers } from '../controllers/userController.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'clubops_jwt_secret_dev_key_2026_super_secure';
    const decoded = jwt.verify(token, jwtSecret);

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.id)) {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    }

    const memUser = inMemoryUsers.find(
      (u) => String(u._id) === String(decoded.id) || u.email === decoded.email
    );
    if (memUser) {
      req.user = {
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'User belonging to this token no longer exists',
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid or expired',
    });
  }
};

