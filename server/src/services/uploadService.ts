import cloudinary from '../utils/cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload image to Cloudinary
 * @param filePath - Path to the file (from multer)
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with upload result
 */
export const uploadImageToCloudinary = async (
  filePath: string,
  folder: string = 'recipes'
): Promise<UploadResult> => {
  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      transformation: [
        {
          width: 800,
          height: 600,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    const uploadError = error as UploadApiErrorResponse;
    console.error('Cloudinary upload error:', uploadError);
    return {
      success: false,
      error: uploadError.message || 'Failed to upload image to Cloudinary',
    };
  }
};

/**
 * Upload image buffer to Cloudinary (for direct file uploads)
 * @param buffer - Image file buffer
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with upload result
 */
export const uploadImageBufferToCloudinary = async (
  buffer: Buffer,
  folder: string = 'recipes'
): Promise<UploadResult> => {
  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          {
            width: 800,
            height: 600,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          resolve({
            success: false,
            error: error.message || 'Failed to upload image to Cloudinary',
          });
        } else if (result) {
          resolve({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          resolve({
            success: false,
            error: 'Unknown error occurred during upload',
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image in Cloudinary
 * @returns Promise with deletion result
 */
export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    const deleteError = error as UploadApiErrorResponse;
    console.error('Cloudinary delete error:', deleteError);
    return {
      success: false,
      error: deleteError.message || 'Failed to delete image from Cloudinary',
    };
  }
};
