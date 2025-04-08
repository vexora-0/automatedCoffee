import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Recipe from '../models/Recipe';
import RecipeCategory from '../models/RecipeCategory';
import RecipeIngredient from '../models/RecipeIngredient';
import Ingredient from '../models/Ingredient';
import Order from '../models/Order';

// Get all recipe categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await RecipeCategory.find();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create recipe category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    
    const category = await RecipeCategory.create({
      category_id: uuidv4(),
      name
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all recipes
export const getAllRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    
    const query = category ? { category_id: category } : {};
    
    const recipes = await Recipe.find(query).sort({ created_at: -1 });
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single recipe
export const getRecipeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipe = await Recipe.findOne({ recipe_id: req.params.recipeId });

    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Get recipe ingredients
    const ingredients = await RecipeIngredient.find({ recipe_id: req.params.recipeId })
      .populate('ingredient_id');

    res.status(200).json({
      success: true,
      data: {
        ...recipe.toObject(),
        ingredients
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

// Create recipe
export const createRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      category_id,
      price,
      image_url,
      calories,
      protein,
      carbs,
      fat,
      sugar,
      ingredients
    } = req.body;
    
    // Check if category exists
    const category = await RecipeCategory.findOne({ category_id });
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }
    
    // Create recipe
    const recipe = await Recipe.create({
      recipe_id: uuidv4(),
      name,
      description,
      category_id,
      price,
      image_url,
      calories,
      protein,
      carbs,
      fat,
      sugar,
      created_at: new Date()
    });
    
    // Add recipe ingredients if provided
    if (ingredients && Array.isArray(ingredients)) {
      const recipeIngredients = [];
      
      for (const item of ingredients) {
        // Verify ingredient exists
        const ingredient = await Ingredient.findOne({ ingredient_id: item.ingredient_id });
        if (!ingredient) {
          continue; // Skip invalid ingredients
        }
        
        const recipeIngredient = await RecipeIngredient.create({
          id: uuidv4(),
          recipe_id: recipe.recipe_id,
          ingredient_id: item.ingredient_id,
          quantity: item.quantity
        });
        
        recipeIngredients.push(recipeIngredient);
      }
      
      res.status(201).json({
        success: true,
        data: {
          ...recipe.toObject(),
          ingredients: recipeIngredients
        }
      });
    } else {
      res.status(201).json({
        success: true,
        data: recipe
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update recipe
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      category_id,
      price,
      image_url,
      calories,
      protein,
      carbs,
      fat,
      sugar,
      ingredients
    } = req.body;
    
    const recipe = await Recipe.findOne({ recipe_id: req.params.recipeId });

    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }
    
    // If category is being updated, verify it exists
    if (category_id) {
      const category = await RecipeCategory.findOne({ category_id });
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }
    }

    const updatedRecipe = await Recipe.findOneAndUpdate(
      { recipe_id: req.params.recipeId },
      {
        name,
        description,
        category_id,
        price,
        image_url,
        calories,
        protein,
        carbs,
        fat,
        sugar
      },
      { new: true, runValidators: true }
    );
    
    // Update recipe ingredients if provided
    if (ingredients && Array.isArray(ingredients)) {
      // Remove existing ingredients
      await RecipeIngredient.deleteMany({ recipe_id: req.params.recipeId });
      
      const recipeIngredients = [];
      
      for (const item of ingredients) {
        // Verify ingredient exists
        const ingredient = await Ingredient.findOne({ ingredient_id: item.ingredient_id });
        if (!ingredient) {
          continue; // Skip invalid ingredients
        }
        
        const recipeIngredient = await RecipeIngredient.create({
          id: uuidv4(),
          recipe_id: req.params.recipeId,
          ingredient_id: item.ingredient_id,
          quantity: item.quantity
        });
        
        recipeIngredients.push(recipeIngredient);
      }
      
      res.status(200).json({
        success: true,
        data: {
          ...updatedRecipe?.toObject(),
          ingredients: recipeIngredients
        }
      });
    } else {
      res.status(200).json({
        success: true,
        data: updatedRecipe
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete recipe
export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipe = await Recipe.findOne({ recipe_id: req.params.recipeId });

    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }
    
    // Check if there are orders for this recipe
    const ordersUsingRecipe = await Order.find({ recipe_id: req.params.recipeId });
    
    if (ordersUsingRecipe.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete recipe that has existing orders'
      });
      return;
    }
    
    // Delete recipe ingredients
    await RecipeIngredient.deleteMany({ recipe_id: req.params.recipeId });
    
    // Delete recipe
    await Recipe.findOneAndDelete({ recipe_id: req.params.recipeId });

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