import express from 'express';
import {
  getAllCategories,
  createCategory,
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe
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

router.route('/:recipeId')
  .get(getRecipeById)
  .put(updateRecipe)
  .delete(deleteRecipe);

export default router; 