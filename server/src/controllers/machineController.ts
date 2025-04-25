import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Machine from '../models/Machine';
import MachineIngredientInventory from '../models/MachineIngredientInventory';
import Warning from '../models/Warning';
import websocketService from '../services/websocketService';
import mongoose from 'mongoose';

// Get all machines
export const getAllMachines = async (req: Request, res: Response): Promise<void> => {
  try {
    const machines = await Machine.find().sort({ created_at: -1 });
    res.status(200).json({
      success: true,
      count: machines.length,
      data: machines
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single machine
export const getMachineById = async (req: Request, res: Response): Promise<void> => {
  try {
    const machine = await Machine.findOne({ machine_id: req.params.machineId });

    if (!machine) {
      res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new machine
export const createMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      location,
      status,
      temperature_c,
      cleaning_water_ml,
      last_regular_service,
      last_deep_service,
      revenue_total
    } = req.body;
    
    const machine = await Machine.create({
      machine_id: uuidv4(),
      location,
      status,
      temperature_c,
      cleaning_water_ml,
      last_regular_service,
      last_deep_service,
      revenue_total: revenue_total || 0,
      created_at: new Date()
    });

    // Emit websocket event for new machine
    websocketService.emitMachineStatusUpdate(machine);
    websocketService.emitMachineTemperatureUpdate(machine);

    res.status(201).json({
      success: true,
      data: machine
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update machine
export const updateMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      location,
      status,
      temperature_c,
      cleaning_water_ml,
      last_regular_service,
      last_deep_service,
      revenue_total
    } = req.body;
    
    const machine = await Machine.findOne({ machine_id: req.params.machineId });

    if (!machine) {
      res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
      return;
    }

    const updatedMachine = await Machine.findOneAndUpdate(
      { machine_id: req.params.machineId },
      {
        location,
        status,
        temperature_c,
        cleaning_water_ml,
        last_regular_service,
        last_deep_service,
        revenue_total
      },
      { new: true, runValidators: true }
    );

    if (updatedMachine) {
      // Emit websocket events if status or temperature changed
      if (machine.status !== status) {
        websocketService.emitMachineStatusUpdate(updatedMachine);
      }
      
      if (machine.temperature_c !== temperature_c) {
        websocketService.emitMachineTemperatureUpdate(updatedMachine);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedMachine
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete machine
export const deleteMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const machine = await Machine.findOne({ machine_id: req.params.machineId });

    if (!machine) {
      res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
      return;
    }

    // Delete associated inventory
    await MachineIngredientInventory.deleteMany({ machine_id: req.params.machineId });
    
    // Delete associated warnings
    await Warning.deleteMany({ machine_id: req.params.machineId });

    await Machine.findOneAndDelete({ machine_id: req.params.machineId });

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

// Get machine inventory
export const getMachineInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    // First get the inventory items
    const inventoryItems = await MachineIngredientInventory.find({ 
      machine_id: req.params.machineId 
    });

    // Get all ingredient IDs from the inventory
    const ingredientIds = inventoryItems.map(item => item.ingredient_id);

    // Find all ingredients in one query
    const Ingredient = mongoose.model('Ingredient');
    const ingredients = await Ingredient.find({ 
      ingredient_id: { $in: ingredientIds } 
    });

    // Create a map of ingredient_id to ingredient for quick lookup
    const ingredientMap: Record<string, any> = {};
    ingredients.forEach(ingredient => {
      ingredientMap[ingredient.ingredient_id] = ingredient;
    });

    // Create a response with ingredient details
    const inventory = inventoryItems.map(item => {
      return {
        ...item.toObject(),
        ingredient: ingredientMap[item.ingredient_id] || null
      };
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error: any) {
    console.error('Machine inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update machine inventory
export const updateMachineInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ingredient_id, quantity, max_capacity } = req.body;
    
    if (!ingredient_id || quantity === undefined) {
      res.status(400).json({
        success: false,
        message: 'Please provide ingredient_id and quantity'
      });
      return;
    }
    
    let inventory = await MachineIngredientInventory.findOne({
      machine_id: req.params.machineId,
      ingredient_id
    });

    if (inventory) {
      // Update existing inventory
      const updateData: any = { 
        quantity, 
        updated_at: new Date() 
      };
      
      // Only include max_capacity if it's defined
      if (max_capacity !== undefined) {
        updateData.max_capacity = max_capacity;
      }
      
      inventory = await MachineIngredientInventory.findOneAndUpdate(
        { machine_id: req.params.machineId, ingredient_id },
        updateData,
        { new: true }
      );
    } else {
      // Create new inventory entry
      const newInventory: any = {
        id: uuidv4(),
        machine_id: req.params.machineId,
        ingredient_id,
        quantity,
        updated_at: new Date()
      };
      
      // Include max_capacity if provided
      if (max_capacity !== undefined) {
        newInventory.max_capacity = max_capacity;
      }
      
      inventory = await MachineIngredientInventory.create(newInventory);
    }

    // Check if inventory is low and create warning if needed
    if (quantity <= 10) {
      await Warning.create({
        warning_id: uuidv4(),
        machine_id: req.params.machineId,
        type: 'dispenser_level',
        severity: quantity <= 5 ? 'critical' : 'high',
        message: `Ingredient ID ${ingredient_id} is running low (${quantity} remaining)`,
        status: 'active',
        created_at: new Date()
      });
    }

    // Get the full inventory and emit update via WebSocket
    const fullInventory = await MachineIngredientInventory.find({
      machine_id: req.params.machineId
    });
    
    websocketService.emitMachineInventoryUpdate(req.params.machineId, fullInventory);

    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error: any) {
    console.error('Update machine inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 