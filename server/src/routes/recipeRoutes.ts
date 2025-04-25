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
  updateRecipeImage
} from '../controllers/recipeController';

const router = express.Router();

// Recipe category routes
router.route('/categories')
  .get(getAllCategories)
  .post(createCategory);

// Recipe routes
router.route('/')
  .get(getAllRecipes)
  .post(createRecipe);

// Recipe with image upload routes
router.route('/with-image')
  .post(createRecipeWithImage);

// Update recipe image
router.route('/:recipeId/image')
  .put(updateRecipeImage);

router.route('/:recipeId')
  .get(getRecipeById)
  .put(updateRecipe)
  .delete(deleteRecipe);

export default router; 