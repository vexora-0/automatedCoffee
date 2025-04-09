import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Ensure MongoDB URI is being read correctly
let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.warn('MONGODB_URI not found in environment variables, using default local connection');
  MONGODB_URI = 'mongodb://localhost:27017/automatedCoffee';
}

const connectDB = async (): Promise<typeof mongoose> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    // Add a property to mongoose to indicate connection is ready
    (mongoose as any).isConnected = true;
    
    // Make MongoDB URI available globally to other modules
    (mongoose as any).mongoUri = MONGODB_URI;
    
    return mongoose;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB; 