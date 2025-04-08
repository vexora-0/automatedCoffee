import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Ingredient from '../models/Ingredient';
import MachineIngredientInventory from '../models/MachineIngredientInventory';
import RecipeIngredient from '../models/RecipeIngredient';

// Get all ingredients
export const getAllIngredients = async (req: Request, res: Response): Promise<void> => {
  try {
    const ingredients = await Ingredient.find();
    res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single ingredient
export const getIngredientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const ingredient = await Ingredient.findOne({ ingredient_id: req.params.ingredientId });

    if (!ingredient) {
      res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: ingredient
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new ingredient
export const createIngredient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, unit } = req.body;
    
    const ingredient = await Ingredient.create({
      ingredient_id: uuidv4(),
      name,
      unit
    });

    res.status(201).json({
      success: true,
      data: ingredient
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update ingredient
export const updateIngredient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, unit } = req.body;
    
    const ingredient = await Ingredient.findOne({ ingredient_id: req.params.ingredientId });

    if (!ingredient) {
      res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
      return;
    }

    const updatedIngredient = await Ingredient.findOneAndUpdate(
      { ingredient_id: req.params.ingredientId },
      { name, unit },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedIngredient
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete ingredient
export const deleteIngredient = async (req: Request, res: Response): Promise<void> => {
  try {
    const ingredient = await Ingredient.findOne({ ingredient_id: req.params.ingredientId });

    if (!ingredient) {
      res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
      return;
    }
    
    // Check if ingredient is used in any recipes
    const recipesUsingIngredient = await RecipeIngredient.find({ ingredient_id: req.params.ingredientId });
    
    if (recipesUsingIngredient.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete ingredient that is used in recipes'
      });
      return;
    }
    
    // Delete from machine inventories
    await MachineIngredientInventory.deleteMany({ ingredient_id: req.params.ingredientId });
    
    // Delete the ingredient
    await Ingredient.findOneAndDelete({ ingredient_id: req.params.ingredientId });

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