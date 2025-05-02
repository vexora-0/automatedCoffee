import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Interface for decoded JWT token
interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

// Extending Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Protect routes
export const protect = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token with fallback secret
      const secret = process.env.JWT_SECRET || 'mysecretkey';
      
      // Type cast the decoded token properly
      const decoded = jwt.verify(token, secret) as unknown as DecodedToken;

      // Get user from the token
      const user = await User.findOne({ user_id: decoded.id });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
        return;
      }

      // Set user in request object
      req.user = {
        id: user.user_id,
        role: user.role
      };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
      return;
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
    return;
  }
};

// Admin middleware
export const admin = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
    return;
  }
}; 