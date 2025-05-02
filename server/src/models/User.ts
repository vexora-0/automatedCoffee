import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from '../types';
import bcrypt from 'bcryptjs';

const userSchema: Schema = new Schema({
  user_id: {
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
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  age_group: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Define the User Document interface more explicitly
interface UserDocument extends Document {
  user_id: string;
  name: string;
  email: string;
  password: string;
  age_group: string;
  role: string;
  created_at: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Encrypt password using bcrypt - be very explicit about the password type
userSchema.pre<UserDocument>('save', async function(next) {
  // Only hash password if it was modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Explicitly treat the password as a string
    const passwordString = String(this.password);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(passwordString, salt);
    
    // Set the password to the hashed version
    this.password = hashedPassword;
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  try {
    // Ensure we're treating stored password as string
    const storedPassword = String(this.password);
    return await bcrypt.compare(enteredPassword, storedPassword);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser>('User', userSchema); 