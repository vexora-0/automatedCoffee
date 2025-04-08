import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IRecipeCategory } from '../types';

const recipeCategorySchema: Schema = new Schema({
  category_id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    unique: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IRecipeCategory>('RecipeCategory', recipeCategorySchema); 