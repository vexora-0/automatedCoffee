import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Interface to define image metadata
export interface ImageMetadata {
  cdnUrl: string;   // Full URL to the image
  publicId: string; // Provider's ID for the image (Cloudinary public_id or S3 key)
  width: number;    // Image width
  height: number;   // Image height
  format: string;   // Image format (jpg, png, etc.)
  provider: string; // Which service provided this image ('cloudinary', 'aws', etc.)
}

/**
 * Abstract Image Service Interface
 * This allows us to easily swap providers in the future
 */
export interface IImageService {
  uploadImage(
    file: Express.Multer.File | Buffer, 
    folder?: string, 
    options?: any
  ): Promise<ImageMetadata>;
  
  deleteImage(publicId: string): Promise<boolean>;
  
  getImage(publicId: string): string;
}

/**
 * Cloudinary Implementation
 */
class CloudinaryImageService implements IImageService {
  async uploadImage(
    file: Express.Multer.File | Buffer,
    folder = 'recipes',
    options = {}
  ): Promise<ImageMetadata> {
    try {
      // Generate a unique ID for the image to avoid collisions
      const uniqueFileName = `${folder}_${uuidv4()}`;
      
      // Prepare upload data
      let fileData;
      let uploadOptions = {
        folder,
        public_id: uniqueFileName,
        overwrite: true,
        resource_type: 'auto',
        ...options
      };

      // Process the file based on type
      if (Buffer.isBuffer(file)) {
        // If it's already a buffer
        fileData = file;
      } else {
        // If it's a Multer file
        fileData = file.buffer;
      }
      
      // Convert buffer to base64 for Cloudinary
      const base64Data = `data:${file instanceof Buffer ? 'image/jpeg' : file.mimetype};base64,${fileData.toString('base64')}`;
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(base64Data, uploadOptions);
      
      // Return metadata in a standardized format (provider-agnostic)
      return {
        cdnUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        provider: 'cloudinary'
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  getImage(publicId: string): string {
    return cloudinary.url(publicId, { secure: true });
  }
}

// Create a singleton instance
const imageService: IImageService = new CloudinaryImageService();

export default imageService; 