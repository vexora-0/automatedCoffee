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
import upload from '../middleware/uploadMiddleware';

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
  .post(upload.single('image'), createRecipeWithImage);

// Update recipe image
router.route('/:recipeId/image')
  .put(upload.single('image'), updateRecipeImage);

router.route('/:recipeId')
  .get(getRecipeById)
  .put(updateRecipe)
  .delete(deleteRecipe);

export default router; 