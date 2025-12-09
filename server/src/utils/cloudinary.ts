import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dqffksfw8',
  api_key: process.env.CLOUDINARY_API_KEY || '411388945675769',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'WIV2febr-E_-m0LUKp55jtCm2i8',
});

export default cloudinary;
