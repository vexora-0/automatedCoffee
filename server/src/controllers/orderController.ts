import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/Order';
import Recipe from '../models/Recipe';
import User from '../models/User';
import Machine from '../models/Machine';
import MachineIngredientInventory from '../models/MachineIngredientInventory';
import RecipeIngredient from '../models/RecipeIngredient';
import UserHistory from '../models/UserHistory';
import Warning from '../models/Warning';
import websocketService from '../services/websocketService';
import { finalizeOrderAndUpdateInventory } from '../services/orderFinalizationService';

// Get all orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, machine_id, status } = req.query;
    
    const query: any = {};
    
    if (user_id) query.user_id = user_id;
    if (machine_id) query.machine_id = machine_id;
    if (status) query.status = status;
    
    const orders = await Order.find(query)
      .sort({ ordered_at: -1 })
      .populate('user_id')
      .populate('machine_id')
      .populate('recipe_id');
      
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single order
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({ order_id: req.params.orderId })
      .populate('user_id')
      .populate('machine_id')
      .populate('recipe_id');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, machine_id, recipe_id } = req.body;
    
    // Verify user exists
    const user = await User.findOne({ user_id });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Verify machine exists and is operational
    const machine = await Machine.findOne({ machine_id });
    if (!machine) {
      res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
      return;
    }
    
    if (machine.status !== 'active') {
      res.status(400).json({
        success: false,
        message: `Machine is not operational. Current status: ${machine.status}`
      });
      return;
    }
    
    // Verify recipe exists
    const recipe = await Recipe.findOne({ recipe_id });
    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }
    
    // Check if machine has required ingredients
    const recipeIngredients = await RecipeIngredient.find({ recipe_id });
    const machineInventory = await MachineIngredientInventory.find({ machine_id });
    
    const missingIngredients = [];
    
    for (const recipeIngredient of recipeIngredients) {
      const inventoryItem = machineInventory.find(
        item => item.ingredient_id === recipeIngredient.ingredient_id
      );
      
      if (!inventoryItem || inventoryItem.quantity < recipeIngredient.quantity) {
        missingIngredients.push(recipeIngredient.ingredient_id);
      }
    }
    
    if (missingIngredients.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Machine is missing required ingredients',
        missingIngredients
      });
      return;
    }
    
    // Create order
    const order = await Order.create({
      order_id: uuidv4(),
      user_id,
      machine_id,
      recipe_id,
      bill: recipe.price,
      ordered_at: new Date(),
      status: 'processing'
    });
    
    // Update machine inventory by subtracting the used ingredients
    for (const recipeIngredient of recipeIngredients) {
      const inventoryItem = machineInventory.find(
        item => item.ingredient_id === recipeIngredient.ingredient_id
      );
      
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity - recipeIngredient.quantity;
        
        await MachineIngredientInventory.findOneAndUpdate(
          { id: inventoryItem.id },
          { quantity: newQuantity, updated_at: new Date() }
        );
        
        // If inventory is low after the order, create a warning
        if (newQuantity <= 10) {
          await Warning.create({
            warning_id: uuidv4(),
            machine_id,
            type: 'dispenser_level',
            severity: newQuantity <= 5 ? 'critical' : 'high',
            message: `Ingredient ID ${recipeIngredient.ingredient_id} is running low (${newQuantity} remaining)`,
            status: 'active',
            created_at: new Date()
          });
        }
      }
    }
    
    // Update machine revenue
    await Machine.findOneAndUpdate(
      { machine_id },
      { $inc: { revenue_total: order.bill } }
    );
    
    // --- Emit recipe availability update ---
    // Fetch all recipes
    const recipes = await Recipe.find({}).lean();
    // Fetch all recipe ingredients
    const allRecipeIngredients = await RecipeIngredient.find({}).lean();
    // Fetch updated machine inventory
    const updatedInventory = await MachineIngredientInventory.find({ machine_id }).lean();
    // Build inventory map for quick lookup
    const inventoryMap: Record<string, number> = {};
    updatedInventory.forEach(item => {
      inventoryMap[item.ingredient_id] = item.quantity;
    });
    // Build recipeId -> ingredients[] map
    const recipeIngredientMap: Record<string, Array<{ingredient_id: string, quantity: number}>> = {};
    allRecipeIngredients.forEach(ri => {
      if (!recipeIngredientMap[ri.recipe_id]) recipeIngredientMap[ri.recipe_id] = [];
      recipeIngredientMap[ri.recipe_id].push({ ingredient_id: ri.ingredient_id, quantity: ri.quantity });
    });
    // Compute availability
    const availableRecipes = [];
    const unavailableRecipes = [];
    const missingIngredientsByRecipe: Record<string, string[]> = {};
    for (const r of recipes) {
      const ingredients = recipeIngredientMap[r.recipe_id] || [];
      const missing = [];
      for (const ri of ingredients) {
        if (!inventoryMap[ri.ingredient_id] || inventoryMap[ri.ingredient_id] < ri.quantity) {
          missing.push(ri.ingredient_id);
        }
      }
      if (missing.length === 0) {
        availableRecipes.push(r);
      } else {
        unavailableRecipes.push(r);
        missingIngredientsByRecipe[r.recipe_id] = missing;
      }
    }
    websocketService.emitRecipeAvailabilityUpdate(machine_id, {
      availableRecipes,
      unavailableRecipes,
      missingIngredientsByRecipe
    });
    // --- End emit recipe availability update ---
    
    // Create user history entry
    await UserHistory.create({
      history_id: uuidv4(),
      user_id,
      action: `Ordered ${recipe.name}`,
      timestamp: new Date()
    });
    
    // Complete the order (in a real system, this would happen after preparation)
    await Order.findOneAndUpdate(
      { order_id: order.order_id },
      { 
        status: 'completed',
        bill: recipe.price 
      }
    );

    res.status(201).json({
      success: true,
      data: {
        ...order.toObject(),
        user,
        machine,
        recipe,
        status: 'completed'
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

// Update order status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
      return;
    }
    
    const order = await Order.findOne({ order_id: req.params.orderId });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { order_id: req.params.orderId },
      { status },
      { new: true }
    );

    // Apply inventory and availability changes only on first transition to completed
    if (status === 'completed' && updatedOrder && order.status !== 'completed') {
      await finalizeOrderAndUpdateInventory(updatedOrder);
    }

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Rate order
export const rateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating } = req.body;
    
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
      return;
    }
    
    const order = await Order.findOne({ order_id: req.params.orderId });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }
    
    if (order.status !== 'completed') {
      res.status(400).json({
        success: false,
        message: 'Can only rate completed orders'
      });
      return;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { order_id: req.params.orderId },
      { rating },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};