import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IRecipe, IImageMetadata } from '../types';

const recipeSchema: Schema = new Schema({
  recipe_id: {
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
  description: {
    type: String,
    required: true
  },
  category_id: {
    type: String,
    ref: 'RecipeCategory',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  // Legacy field - will be deprecated in favor of image object
  image_url: {
    type: String,
    maxlength: 255
  },
  // New image structure compatible with both Cloudinary and future AWS migration
  image: {
    cdnUrl: {
      type: String,
      required: true,
      default: ''
    },
    publicId: {
      type: String,
      required: true,
      default: ''
    },
    width: {
      type: Number,
      required: true,
      default: 0
    },
    height: {
      type: Number,
      required: true,
      default: 0
    },
    format: {
      type: String,
      required: true,
      default: ''
    },
    provider: {
      type: String,
      required: true,
      default: 'cloudinary'
    }
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  sugar: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add a pre-save hook to ensure backward compatibility
recipeSchema.pre('save', function(this: IRecipe, next) {
  // If we have an image object with a cdnUrl but no image_url, update image_url
  if (this.image?.cdnUrl && !this.image_url) {
    this.image_url = this.image.cdnUrl;
  }
  // Vice versa - if we have an image_url but no image.cdnUrl, update image.cdnUrl
  else if (this.image_url && (!this.image?.cdnUrl)) {
    if (!this.image) {
      this.image = {
        cdnUrl: this.image_url,
        publicId: '',
        width: 0,
        height: 0,
        format: '',
        provider: 'cloudinary'
      };
    } else {
      this.image.cdnUrl = this.image_url;
    }
  }
  next();
});

export default mongoose.model<IRecipe>('Recipe', recipeSchema); 