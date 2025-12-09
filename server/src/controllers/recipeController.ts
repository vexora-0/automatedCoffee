import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Recipe from '../models/Recipe';
import RecipeCategory from '../models/RecipeCategory';
import RecipeIngredient from '../models/RecipeIngredient';
import Ingredient from '../models/Ingredient';
import Order from '../models/Order';
import websocketService from '../services/websocketService';
import MachineIngredientInventory from '../models/MachineIngredientInventory';
import { uploadImageBufferToCloudinary, deleteImageFromCloudinary } from '../services/uploadService';
import fs from 'fs';
import path from 'path';

// Extend Express Request to include multer file
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

interface MulterRequest extends Request {
  file?: MulterFile;
}

// Helper function to emit recipe updates
const emitRecipeUpdates = async () => {
  const recipes = await Recipe.find().sort({ created_at: -1 });
  websocketService.emitRecipeUpdate(recipes);
};

// Get all recipe ingredients
export const getAllRecipeIngredients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipe } = req.query;
    
    // Optional filtering by recipe_id
    const query = recipe ? { recipe_id: recipe } : {};
    
    const recipeIngredients = await RecipeIngredient.find(query);
    res.status(200).json({
      success: true,
      count: recipeIngredients.length,
      data: recipeIngredients
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

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

// Create recipe with image
export const createRecipeWithImage = async (req: MulterRequest, res: Response): Promise<void> => {
  let imageUrl: string | undefined = undefined;
  let uploadedFile: MulterFile | undefined = undefined;

  try {
    // Get uploaded file from multer
    uploadedFile = req.file;

    // Parse recipe data from request body
    const recipeData = req.body.recipe ? JSON.parse(req.body.recipe) : req.body;
    
    // Check if category exists
    const category = await RecipeCategory.findOne({ category_id: recipeData.category_id });
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    // Upload image to Cloudinary if file is provided
    if (uploadedFile) {
      const fileBuffer = fs.readFileSync(uploadedFile.path);
      const uploadResult = await uploadImageBufferToCloudinary(fileBuffer, 'recipes');
      
      // Clean up local file
      fs.unlinkSync(uploadedFile.path);

      if (!uploadResult.success || !uploadResult.url) {
        res.status(500).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadResult.error
        });
        return;
      }

      imageUrl = uploadResult.url;
    } else if (recipeData.image_url) {
      // Use provided image URL if no file uploaded
      imageUrl = recipeData.image_url;
    }
    
    // Create recipe
    const recipe = await Recipe.create({
      recipe_id: uuidv4(),
      name: recipeData.name,
      description: recipeData.description,
      category_id: recipeData.category_id,
      price: recipeData.price,
      image_url: imageUrl,
      calories: recipeData.calories,
      protein: recipeData.protein,
      carbs: recipeData.carbs,
      fat: recipeData.fat,
      sugar: recipeData.sugar,
      created_at: new Date()
    });
    
    // Add recipe ingredients if provided
    if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
      const recipeIngredients = [];
      
      for (const item of recipeData.ingredients) {
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
      
      // Emit recipe update via WebSocket
      await emitRecipeUpdates();
      
      res.status(201).json({
        success: true,
        data: {
          ...recipe.toObject(),
          ingredients: recipeIngredients
        }
      });
    } else {
      // Emit recipe update via WebSocket
      await emitRecipeUpdates();
      
      res.status(201).json({
        success: true,
        data: recipe
      });
    }
  } catch (error: any) {
    // Clean up uploaded file if error occurred
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update recipe image
export const updateRecipeImage = async (req: MulterRequest, res: Response): Promise<void> => {
  let uploadedFile: MulterFile | undefined = undefined;

  try {
    const { recipeId } = req.params;
    
    // Find recipe
    const recipe = await Recipe.findOne({ recipe_id: recipeId });
    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Get uploaded file from multer
    uploadedFile = req.file;
    let imageUrl: string | undefined = undefined;

    // Upload new image to Cloudinary if file is provided
    if (uploadedFile) {
      const fileBuffer = fs.readFileSync(uploadedFile.path);
      const uploadResult = await uploadImageBufferToCloudinary(fileBuffer, 'recipes');
      
      // Clean up local file
      fs.unlinkSync(uploadedFile.path);

      if (!uploadResult.success || !uploadResult.url) {
        res.status(500).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadResult.error
        });
        return;
      }

      imageUrl = uploadResult.url;

      // Delete old image from Cloudinary if it exists and is a Cloudinary URL
      if (recipe.image_url && recipe.image_url.includes('cloudinary.com')) {
        // Extract public_id from Cloudinary URL
        const urlParts = recipe.image_url.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split('.')[0];
        const folderPath = urlParts.slice(-2, -1)[0]; // Get folder name
        const fullPublicId = folderPath ? `${folderPath}/${publicId}` : publicId;
        
        await deleteImageFromCloudinary(fullPublicId);
      }
    } else if (req.body.image_url) {
      // Use provided image URL if no file uploaded
      imageUrl = req.body.image_url;
    } else {
      res.status(400).json({
        success: false,
        message: 'No image file or URL provided'
      });
      return;
    }
    
    // Update recipe with new image
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { recipe_id: recipeId },
      { image_url: imageUrl },
      { new: true }
    );
    
    // Emit recipe update via WebSocket
    await emitRecipeUpdates();
    
    res.status(200).json({
      success: true,
      data: updatedRecipe
    });
  } catch (error: any) {
    // Clean up uploaded file if error occurred
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }

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
      
      // Emit recipe update via WebSocket
      await emitRecipeUpdates();
      
      res.status(201).json({
        success: true,
        data: {
          ...recipe.toObject(),
          ingredients: recipeIngredients
        }
      });
    } else {
      // Emit recipe update via WebSocket
      await emitRecipeUpdates();
      
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
      
      // Emit recipe update via WebSocket
      await emitRecipeUpdates();
      
      res.status(200).json({
        success: true,
        data: {
          ...updatedRecipe?.toObject(),
          ingredients: recipeIngredients
        }
      });
    } else {
      // Emit recipe update via WebSocket
      await emitRecipeUpdates();
      
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

    // Check if recipe is in use in any orders
    const orders = await Order.find({ recipe_id: req.params.recipeId });
    if (orders.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete recipe as it is used in orders'
      });
      return;
    }

    // Delete associated ingredients
    await RecipeIngredient.deleteMany({ recipe_id: req.params.recipeId });
    
    // Delete recipe
    await Recipe.findOneAndDelete({ recipe_id: req.params.recipeId });

    // Emit recipe update via WebSocket
    await emitRecipeUpdates();

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

// --- RECIPE AVAILABILITY ENDPOINT ---
/**
 * Get recipe availability for a machine
 * Returns available/unavailable recipes and missing ingredients
 * Emits via WebSocket as well
 */
export const getRecipeAvailabilityForMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId } = req.query;

    if (!machineId) {
      res.status(400).json({
        success: false,
        message: 'Machine ID is required'
      });
      return;
    }

    console.log(`[RecipeController] Computing availability for machine: ${machineId}`);

    // Fetch all recipes
    const recipes = await Recipe.find({}).lean();
    
    // Fetch all recipe ingredients
    const recipeIngredients = await RecipeIngredient.find({}).lean();
    
    // Fetch machine inventory
    const machineInventory = await MachineIngredientInventory.find({ 
      machine_id: machineId 
    }).lean();

    console.log(`[RecipeController] Found ${recipes.length} recipes, ${recipeIngredients.length} recipe ingredients, ${machineInventory.length} inventory items`);

    // Build inventory map for quick lookups
    const inventoryMap: Record<string, number> = {};
    machineInventory.forEach(item => {
      inventoryMap[item.ingredient_id] = item.quantity;
    });

    // Organize recipe ingredients by recipe ID
    const recipeIngredientsMap: Record<string, Array<any>> = {};
    recipeIngredients.forEach(ri => {
      if (!recipeIngredientsMap[ri.recipe_id]) {
        recipeIngredientsMap[ri.recipe_id] = [];
      }
      recipeIngredientsMap[ri.recipe_id].push(ri);
    });

    // Calculate availability for each recipe
    const availableRecipes: any[] = [];
    const unavailableRecipes: any[] = [];
    const missingIngredientsByRecipe: Record<string, string[]> = {};

    recipes.forEach(recipe => {
      const ingredients = recipeIngredientsMap[recipe.recipe_id] || [];
      const missingIngredients: string[] = [];

      // Check if all ingredients are available in sufficient quantity
      ingredients.forEach(ri => {
        const availableQuantity = inventoryMap[ri.ingredient_id] || 0;
        
        if (availableQuantity < ri.quantity) {
          missingIngredients.push(ri.ingredient_id);
        }
      });

      if (missingIngredients.length === 0) {
        availableRecipes.push(recipe);
      } else {
        unavailableRecipes.push(recipe);
        missingIngredientsByRecipe[recipe.recipe_id] = missingIngredients;
      }
    });

    const result = {
      availableRecipes,
      unavailableRecipes,
      missingIngredientsByRecipe
    };

    // Emit the result via WebSocket
    websocketService.emitRecipeAvailabilityUpdate(machineId as string, result);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('[RecipeController] Error computing availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 