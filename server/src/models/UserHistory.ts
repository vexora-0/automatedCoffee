import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IUserHistory } from '../types';

const userHistorySchema: Schema = new Schema({
  history_id: {
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
  action: {
    type: String,
    required: true,
    maxlength: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IUserHistory>('UserHistory', userHistorySchema); 