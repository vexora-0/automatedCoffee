import express from 'express';
import {
  getAllCategories,
  createCategory,
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  createRecipeWithImage,
  updateRecipeImage,
  getAllRecipeIngredients,
  getRecipeAvailabilityForMachine
} from '../controllers/recipeController';
import { uploadSingle } from '../middleware/upload';

const router = express.Router();

// Recipe category routes
router.route('/categories')
  .get(getAllCategories)
  .post(createCategory);

// Recipe ingredient routes
router.route('/ingredients')
  .get(getAllRecipeIngredients);

// Recipe routes
router.route('/')
  .get(getAllRecipes)
  .post(createRecipe);

// Recipe with image upload routes
router.route('/with-image')
  .post(uploadSingle, createRecipeWithImage);

// Update recipe image
router.route('/:recipeId/image')
  .put(uploadSingle, updateRecipeImage);
  
router.route('/availability').get(getRecipeAvailabilityForMachine);

router.route('/:recipeId')
  .get(getRecipeById)
  .put(updateRecipe)
  .delete(deleteRecipe);

// Add recipe availability endpoint

export default router; 