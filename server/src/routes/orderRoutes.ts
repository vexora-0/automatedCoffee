import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  rateOrder
} from '../controllers/orderController';

const router = express.Router();

router.route('/')
  .get(getAllOrders)
  .post(createOrder);

router.route('/:orderId')
  .get(getOrderById);

router.route('/:orderId/status')
  .put(updateOrderStatus);

router.route('/:orderId/rate')
  .put(rateOrder);

export default router;