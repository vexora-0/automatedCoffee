// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

// User Types
export interface User {
  user_id: string;
  name: string;
  age_group: string;
  role: 'customer' | 'admin';
  created_at: Date;
}

export interface UserHistory {
  history_id: string;
  user_id: string;
  action: string;
  timestamp: Date;
}

// Machine Types
export interface Machine {
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

// Ingredient Types
export interface Ingredient {
  ingredient_id: string;
  name: string;
  unit: string;
}

export interface MachineIngredientInventory {
  id: string;
  machine_id: string;
  ingredient_id: string;
  quantity: number;
  max_capacity?: number;
  updated_at: Date;
}

// Recipe Types
export interface RecipeCategory {
  category_id: string;
  name: string;
}

export interface Recipe {
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

// Form data interfaces for submitting recipes with images
export interface RecipeFormData {
  name: string;
  description: string;
  category_id: string;
  price: number;
  image_url?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  ingredients?: {
    ingredient_id: string;
    quantity: number;
  }[];
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
}

// Order Types
export interface Order {
  order_id: string;
  user_id: string;
  machine_id: string;
  recipe_id: string;
  ordered_at: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  rating: number | null;
}

// Warning Types
export interface Warning {
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