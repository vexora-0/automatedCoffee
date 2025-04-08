import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IOrder } from '../types';

const orderSchema: Schema = new Schema({
  order_id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  user_id: {
    type: String,
    ref: 'User',
    required: true
  },
  machine_id: {
    type: String,
    ref: 'Machine',
    required: true
  },
  recipe_id: {
    type: String,
    ref: 'Recipe',
    required: true
  },
  ordered_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model<IOrder>('Order', orderSchema); 