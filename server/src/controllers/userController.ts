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

// Create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, age_group, role } = req.body;
    
    const user = await User.create({
      user_id: uuidv4(),
      name,
      age_group,
      role,
      created_at: new Date()
    });

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
    const { name, age_group, role } = req.body;
    
    const user = await User.findOne({ user_id: req.params.userId });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const updatedUser = await User.findOneAndUpdate(
      { user_id: req.params.userId },
      { name, age_group, role },
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