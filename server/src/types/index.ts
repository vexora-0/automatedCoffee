import { Document } from 'mongoose';

export interface IUser extends Document {
  user_id: string;
  name: string;
  age_group: string;
  role: 'customer' | 'admin';
  created_at: Date;
}

export interface IUserHistory extends Document {
  history_id: string;
  user_id: string;
  action: string;
  timestamp: Date;
}

export interface IMachine extends Document {
  machine_id: string;
  location: string;
  status: string;
  temperature_c: number;
  cleaning_water_ml: number;
  last_regular_service: Date;
  last_deep_service: Date;
  revenue_total: number;
  created_at: Date;
}

export interface IIngredient extends Document {
  ingredient_id: string;
  name: string;
  unit: string;
}

export interface IMachineIngredientInventory extends Document {
  id: string;
  machine_id: string;
  ingredient_id: string;
  quantity: number;
  max_capacity?: number;
  updated_at: Date;
}

export interface IRecipeCategory extends Document {
  category_id: string;
  name: string;
}

export interface IRecipe extends Document {
  recipe_id: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  image_url: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  created_at: Date;
}

export interface IRecipeIngredient extends Document {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
}

export interface IOrder extends Document {
  order_id: string;
  user_id: string;
  machine_id: string;
  recipe_id: string;
  ordered_at: Date;
  status: string;
  rating: number;
}

export interface IWarning extends Document {
  warning_id: string;
  machine_id: string;
  order_id?: string;
  type: 'communication_error' | 'software_error' | 'dispenser_level' | 'dispenser_expiry';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'active' | 'resolved';
  resolved_at?: Date;
  created_at: Date;
} 