import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IStaff } from '../types';
import bcrypt from 'bcryptjs';

const staffSchema: Schema = new Schema({
  staff_id: {
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
  mobile_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\d{10}$/.test(v); // Validates 10-digit phone numbers
      },
      message: 'Please enter a valid 10-digit mobile number'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  documents: [{
    type: String, // URLs/links to documents stored in CDN
    required: false
  }],
  assigned_machine_ids: [{
    type: String,
    required: false
  }],
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: String,
    required: true // Admin who created this staff member
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updated_at field before save
staffSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create compound index for better query performance
staffSchema.index({ email: 1, mobile_number: 1 });
staffSchema.index({ is_active: 1, created_at: -1 });

export default mongoose.model<IStaff>('Staff', staffSchema); 