import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IIngredient } from '../types';

const ingredientSchema: Schema = new Schema({
  ingredient_id: {
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
  unit: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  }
}, {
  timestamps: true
});

export default mongoose.model<IIngredient>('Ingredient', ingredientSchema); 