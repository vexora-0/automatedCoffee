import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import UserHistory from '../models/UserHistory';

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single user
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ user_id: req.params.userId });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Check if user exists by phone number
export const checkUserByPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone_number } = req.body;
    
    if (!phone_number) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
      return;
    }

    const user = await User.findOne({ phone_number });
    
    if (user) {
      // User exists, return user data
      res.status(200).json({
        success: true,
        exists: true,
        data: user
      });
    } else {
      // User doesn't exist
      res.status(200).json({
        success: true,
        exists: false
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone_number, date_of_birth, role } = req.body;
    
    // Check if phone number already exists
    const existingUser = await User.findOne({ phone_number });
    
    if (existingUser) {
      // If user already exists, return the existing user
      res.status(200).json({
        success: true,
        data: existingUser
      });
      return;
    }
    
    // Create new user if not found
    const userData: any = {
      user_id: uuidv4(),
      name,
      phone_number,
      role: role || 'customer',
      created_at: new Date()
    };

    // Add date_of_birth if provided
    if (date_of_birth) {
      userData.date_of_birth = date_of_birth;
    }

    const user = await User.create(userData);

    // Create user history entry
    await UserHistory.create({
      history_id: uuidv4(),
      user_id: user.user_id,
      action: 'User created',
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone_number, date_of_birth, role } = req.body;
    
    const user = await User.findOne({ user_id: req.params.userId });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone_number) updateData.phone_number = phone_number;
    if (date_of_birth) updateData.date_of_birth = date_of_birth;
    if (role) updateData.role = role;

    const updatedUser = await User.findOneAndUpdate(
      { user_id: req.params.userId },
      updateData,
      { new: true, runValidators: true }
    );

    // Create user history entry
    await UserHistory.create({
      history_id: uuidv4(),
      user_id: req.params.userId,
      action: 'User updated',
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ user_id: req.params.userId });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    await User.findOneAndDelete({ user_id: req.params.userId });

    // Create user history entry
    await UserHistory.create({
      history_id: uuidv4(),
      user_id: req.params.userId,
      action: 'User deleted',
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get user history
export const getUserHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userHistory = await UserHistory.find({ user_id: req.params.userId }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: userHistory.length,
      data: userHistory
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 