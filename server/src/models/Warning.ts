import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IWarning } from '../types';

const warningSchema: Schema = new Schema({
  warning_id: {
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
  order_id: {
    type: String,
    ref: 'Order',
    default: null
  },
  type: {
    type: String,
    enum: ['communication_error', 'software_error', 'dispenser_level', 'dispenser_expiry'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active',
    required: true
  },
  resolved_at: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IWarning>('Warning', warningSchema); 