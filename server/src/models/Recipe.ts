import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IRecipe } from '../types';

const recipeSchema: Schema = new Schema({
  recipe_id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true
  },
  category_id: {
    type: String,
    ref: 'RecipeCategory',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image_url: {
    type: String,
    maxlength: 255
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  sugar: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IRecipe>('Recipe', recipeSchema); 