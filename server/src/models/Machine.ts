import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IMachine } from '../types';

const machineSchema: Schema = new Schema({
  machine_id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  status: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  temperature_c: {
    type: Number,
    required: true
  },
  cleaning_water_ml: {
    type: Number,
    required: true
  },
  last_regular_service: {
    type: Date,
    required: true
  },
  last_deep_service: {
    type: Date,
    required: true
  },
  revenue_total: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IMachine>('Machine', machineSchema); 