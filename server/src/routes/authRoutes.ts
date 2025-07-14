import express from 'express';
import { register, login, getProfile, staffLogin } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Register new user
router.post('/signup', register);

// Login user
router.post('/login', login);

// Staff login
router.post('/staff-login', staffLogin);

// Get user profile
router.get('/profile', protect, getProfile);

export default router; 