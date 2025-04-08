import express from 'express';
import {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient
} from '../controllers/ingredientController';

const router = express.Router();

router.route('/')
  .get(getAllIngredients)
  .post(createIngredient);

router.route('/:ingredientId')
  .get(getIngredientById)
  .put(updateIngredient)
  .delete(deleteIngredient);

export default router; 