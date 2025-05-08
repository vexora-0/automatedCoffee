import express from 'express';
import {
  getMachineSales,
  getSalesByProduct,
  getSalesByCategory,
  getRevenueAnalytics,
  getPopularProducts,
  getSalesOverTime,
  getMachinePerformance
} from '../controllers/analyticsController';

const router = express.Router();

// Financial metrics routes
router.route('/sales/machine/:machineId')
  .get(getMachineSales);

router.route('/sales/machines')
  .get(getMachineSales);

router.route('/sales/product')
  .get(getSalesByProduct);

router.route('/sales/category')
  .get(getSalesByCategory);

router.route('/revenue')
  .get(getRevenueAnalytics);

router.route('/products/popular')
  .get(getPopularProducts);

router.route('/sales/time')
  .get(getSalesOverTime);

router.route('/performance/machine/:machineId')
  .get(getMachinePerformance);

export default router; 