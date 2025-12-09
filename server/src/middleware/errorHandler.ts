import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developer
  console.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Validation Error';
    error.statusCode = 400;
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  // Handle common browser requests gracefully without logging
  if (req.originalUrl === '/favicon.ico' || req.originalUrl === '/robots.txt') {
    res.status(404).end();
    return;
  }

  // For other 404s, send a proper JSON response
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`
  });
};