import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserHistory,
  checkUserByPhone
} from '../controllers/userController';

const router = express.Router();

router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/check-phone')
  .post(checkUserByPhone);

router.route('/:userId')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.route('/:userId/history')
  .get(getUserHistory);

export default router; 