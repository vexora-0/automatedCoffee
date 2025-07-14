import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Staff from '../models/Staff';
import Machine from '../models/Machine';
import MachineIngredientInventory from '../models/MachineIngredientInventory';

// Get all staff members (Admin only)
export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { is_active } = req.query;
    
    const query: any = {};
    if (is_active !== undefined) {
      query.is_active = is_active === 'true';
    }
    
    const staff = await Staff.find(query)
      .sort({ created_at: -1 });
      
    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get staff member by ID (Admin only)
export const getStaffById = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await Staff.findOne({ staff_id: req.params.staffId });

    if (!staff) {
      res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new staff member (Admin only)
export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      mobile_number, 
      email, 
      address, 
      documents = [], 
      assigned_machine_ids = [] 
    } = req.body;

    // Check if staff with email or mobile already exists
    const existingStaff = await Staff.findOne({
      $or: [{ email }, { mobile_number }]
    });

    if (existingStaff) {
      res.status(400).json({
        success: false,
        message: 'Staff member with this email or mobile number already exists'
      });
      return;
    }

    // Validate assigned machine IDs exist
    if (assigned_machine_ids.length > 0) {
      const machines = await Machine.find({ 
        machine_id: { $in: assigned_machine_ids } 
      });
      
      if (machines.length !== assigned_machine_ids.length) {
        res.status(400).json({
          success: false,
          message: 'One or more assigned machine IDs are invalid'
        });
        return;
      }
    }

    // Create staff member
    const staff = await Staff.create({
      staff_id: uuidv4(),
      name,
      mobile_number,
      email,
      address,
      documents,
      assigned_machine_ids,
      // @ts-ignore - req.user is set by auth middleware
      created_by: req.user.id,
      created_at: new Date()
    });

    res.status(201).json({
      success: true,
      data: staff
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update staff member (Admin only)
export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      mobile_number, 
      email, 
      address, 
      documents, 
      assigned_machine_ids,
      is_active 
    } = req.body;

    const staff = await Staff.findOne({ staff_id: req.params.staffId });

    if (!staff) {
      res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
      return;
    }

    // Check for email/mobile conflicts (excluding current staff)
    if (email || mobile_number) {
      const conflictQuery: any = {
        staff_id: { $ne: req.params.staffId }
      };
      
      if (email && mobile_number) {
        conflictQuery.$or = [{ email }, { mobile_number }];
      } else if (email) {
        conflictQuery.email = email;
      } else if (mobile_number) {
        conflictQuery.mobile_number = mobile_number;
      }

      const existingStaff = await Staff.findOne(conflictQuery);
      if (existingStaff) {
        res.status(400).json({
          success: false,
          message: 'Another staff member with this email or mobile number already exists'
        });
        return;
      }
    }

    // Validate assigned machine IDs if provided
    if (assigned_machine_ids && assigned_machine_ids.length > 0) {
      const machines = await Machine.find({ 
        machine_id: { $in: assigned_machine_ids } 
      });
      
      if (machines.length !== assigned_machine_ids.length) {
        res.status(400).json({
          success: false,
          message: 'One or more assigned machine IDs are invalid'
        });
        return;
      }
    }

    // Update fields
    const updateData: any = { updated_at: new Date() };
    if (name !== undefined) updateData.name = name;
    if (mobile_number !== undefined) updateData.mobile_number = mobile_number;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (documents !== undefined) updateData.documents = documents;
    if (assigned_machine_ids !== undefined) updateData.assigned_machine_ids = assigned_machine_ids;
    if (is_active !== undefined) updateData.is_active = is_active;

    const updatedStaff = await Staff.findOneAndUpdate(
      { staff_id: req.params.staffId },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedStaff
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete staff member (Admin only)
export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await Staff.findOne({ staff_id: req.params.staffId });

    if (!staff) {
      res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
      return;
    }

    await Staff.findOneAndDelete({ staff_id: req.params.staffId });

    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully',
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

// Assign machines to staff (Admin only)
export const assignMachinesToStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machine_ids } = req.body;

    if (!machine_ids || !Array.isArray(machine_ids) || machine_ids.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide an array of machine IDs'
      });
      return;
    }

    const staff = await Staff.findOne({ staff_id: req.params.staffId });

    if (!staff) {
      res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
      return;
    }

    // Validate all machine IDs exist
    const machines = await Machine.find({ 
      machine_id: { $in: machine_ids } 
    });

    if (machines.length !== machine_ids.length) {
      res.status(400).json({
        success: false,
        message: 'One or more machine IDs are invalid'
      });
      return;
    }

    // Add new machine IDs to existing ones (avoid duplicates)
    const uniqueMachineIds = [...new Set([...staff.assigned_machine_ids, ...machine_ids])];

    const updatedStaff = await Staff.findOneAndUpdate(
      { staff_id: req.params.staffId },
      { 
        assigned_machine_ids: uniqueMachineIds,
        updated_at: new Date()
      },
      { new: true }
    ).populate('assigned_machine_ids', 'machine_id location status');

    res.status(200).json({
      success: true,
      message: 'Machines assigned successfully',
      data: updatedStaff
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Remove machine from staff (Admin only)
export const removeMachineFromStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machine_id } = req.params;

    const staff = await Staff.findOne({ staff_id: req.params.staffId });

    if (!staff) {
      res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
      return;
    }

    // Remove machine ID from assigned machines
    const updatedMachineIds = staff.assigned_machine_ids.filter(id => id !== machine_id);

    const updatedStaff = await Staff.findOneAndUpdate(
      { staff_id: req.params.staffId },
      { 
        assigned_machine_ids: updatedMachineIds,
        updated_at: new Date()
      },
      { new: true }
    ).populate('assigned_machine_ids', 'machine_id location status');

    res.status(200).json({
      success: true,
      message: 'Machine removed successfully',
      data: updatedStaff
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get staff's assigned machines (Staff can access their own)
export const getStaffMachines = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params;
    
    // @ts-ignore - req.user is set by auth middleware
    const requestingUser = req.user;
    
    // Allow access if user is admin or if staff is accessing their own data
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'staff') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const staff = await Staff.findOne({ staff_id: staffId })
      .populate('assigned_machine_ids', 'machine_id location status temperature_c cleaning_water_ml last_regular_service last_deep_service');

    if (!staff) {
      res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
      return;
    }

    // If requesting user is staff, ensure they can only access their own data
    if (requestingUser.role === 'staff' && requestingUser.id !== staff.staff_id) {
      res.status(403).json({
        success: false,
        message: 'Access denied - can only view your own assigned machines'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        staff_id: staff.staff_id,
        name: staff.name,
        assigned_machines: staff.assigned_machine_ids
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

// Get machine inventory for staff's assigned machines
export const getStaffMachineInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId, machineId } = req.params;
    
    // @ts-ignore - req.user is set by auth middleware
    const requestingUser = req.user;
    
    // Allow access if user is admin or staff
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'staff') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const staff = await Staff.findOne({ staff_id: staffId });

    if (!staff) {
      res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
      return;
    }

    // If requesting user is staff, ensure they can only access their own data
    if (requestingUser.role === 'staff' && requestingUser.id !== staff.staff_id) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Check if machine is assigned to this staff member
    if (!staff.assigned_machine_ids.includes(machineId)) {
      res.status(403).json({
        success: false,
        message: 'Machine not assigned to this staff member'
      });
      return;
    }

    // Get machine inventory
    const inventoryItems = await MachineIngredientInventory.find({ 
      machine_id: machineId 
    });

    // Get ingredient details
    const ingredientIds = inventoryItems.map(item => item.ingredient_id);
    const Ingredient = require('../models/Ingredient').default;
    const ingredients = await Ingredient.find({ 
      ingredient_id: { $in: ingredientIds } 
    });

    // Create ingredient map
    const ingredientMap: Record<string, any> = {};
    ingredients.forEach((ingredient: any) => {
      ingredientMap[ingredient.ingredient_id] = ingredient;
    });

    // Combine inventory with ingredient details
    const inventory = inventoryItems.map(item => ({
      ...item.toObject(),
      ingredient: ingredientMap[item.ingredient_id] || null
    }));

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error: any) {
    console.error('Staff machine inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 