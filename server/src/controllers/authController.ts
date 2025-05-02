import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import UserHistory from '../models/UserHistory';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mysecretkey', {
    expiresIn: '30d'
  });
};

// Register a user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, age_group, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Create user
    const user = await User.create({
      user_id: uuidv4(),
      name,
      email,
      password,
      age_group,
      role: role || 'customer',
      created_at: new Date()
    });

    // Create user history entry
    await UserHistory.create({
      history_id: uuidv4(),
      user_id: user.user_id,
      action: 'User registered',
      timestamp: new Date()
    });

    // Generate token
    const token = generateToken(user.user_id);

    // Return user data and token
    res.status(201).json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for user with email and include password in the result
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Create user history entry
    await UserHistory.create({
      history_id: uuidv4(),
      user_id: user.user_id,
      action: 'User logged in',
      timestamp: new Date()
    });

    // Generate token
    const token = generateToken(user.user_id);

    // Prepare response data
    const responseData = {
      success: true,
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    };

    // Return user data and token
    res.status(200).json(responseData);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - we assume req.user is set by auth middleware
    const user = await User.findOne({ user_id: req.user.id });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 