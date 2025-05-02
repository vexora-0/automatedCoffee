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
  phone_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\d{10}$/.test(v); // Validates 10-digit Indian phone numbers
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  date_of_birth: {
    type: Date,
    required: false
  },
  email: {
    type: String,
    required: function(this: any) { return this.role === 'admin'; },
    unique: true,
    sparse: true, // Only enforce uniqueness if the field exists
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: function(this: any) { return this.role === 'admin'; },
    minlength: 6,
    select: false
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
  phone_number: string;
  date_of_birth?: Date;
  email?: string;
  password?: string;
  role: string;
  created_at: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Encrypt password using bcrypt - be very explicit about the password type
userSchema.pre<UserDocument>('save', async function(next) {
  // Only hash password if it was modified and exists
  if (!this.isModified('password') || !this.password) {
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
    // If no password exists on this user, return false
    if (!this.password) return false;
    
    // Ensure we're treating stored password as string
    const storedPassword = String(this.password);
    return await bcrypt.compare(enteredPassword, storedPassword);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser>('User', userSchema); 