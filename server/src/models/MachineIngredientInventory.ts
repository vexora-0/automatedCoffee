import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IMachineIngredientInventory } from '../types';

const machineIngredientInventorySchema: Schema = new Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  machine_id: {
    type: String,
    ref: 'Machine',
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
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a machine can only have one entry per ingredient
machineIngredientInventorySchema.index({ machine_id: 1, ingredient_id: 1 }, { unique: true });

export default mongoose.model<IMachineIngredientInventory>('MachineIngredientInventory', machineIngredientInventorySchema); 