import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IRecipeIngredient } from '../types';

const recipeIngredientSchema: Schema = new Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  recipe_id: {
    type: String,
    ref: 'Recipe',
    required: true
  },
  ingredient_id: {
    type: String,
    ref: 'Ingredient',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a recipe can only use an ingredient once
recipeIngredientSchema.index({ recipe_id: 1, ingredient_id: 1 }, { unique: true });

export default mongoose.model<IRecipeIngredient>('RecipeIngredient', recipeIngredientSchema); 