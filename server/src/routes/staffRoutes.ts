import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  assignMachinesToStaff,
  removeMachineFromStaff,
  getStaffMachines,
  getStaffMachineInventory
} from '../controllers/staffController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// Admin-only routes for staff management
router.route('/')
  .get(protect, admin, getAllStaff)      // Get all staff (admin only)
  .post(protect, admin, createStaff);    // Create staff (admin only)

router.route('/:staffId')
  .get(protect, admin, getStaffById)     // Get staff by ID (admin only)
  .put(protect, admin, updateStaff)      // Update staff (admin only)
  .delete(protect, admin, deleteStaff);  // Delete staff (admin only)

// Machine assignment routes (admin only)
router.route('/:staffId/machines')
  .post(protect, admin, assignMachinesToStaff);  // Assign machines to staff (admin only)

router.route('/:staffId/machines/:machine_id')
  .delete(protect, admin, removeMachineFromStaff);  // Remove machine from staff (admin only)

// Staff can access their own machines and inventory
router.route('/:staffId/assigned-machines')
  .get(protect, getStaffMachines);  // Staff can view their own assigned machines

router.route('/:staffId/machines/:machineId/inventory')
  .get(protect, getStaffMachineInventory);  // Staff can view inventory of their assigned machines

export default router; 