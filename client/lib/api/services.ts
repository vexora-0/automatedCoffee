import apiClient from './apiClient';
import {
  User,
  UserHistory,
  Machine,
  MachineIngredientInventory,
  Ingredient,
  RecipeCategory,
  Recipe,
  RecipeFormData,
  Order,
  Warning,
  ApiResponse,
  RecipeIngredient,
  AuthResponse,
  LoginCredentials,
  RegisterData
} from './types';

// ===== AUTH SERVICES =====
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/login', credentials);
    
    // The server returns data directly in the response, not nested in a 'data' property
    return response.data;
  },

  // Register new user
  register: async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/signup', userData);
    
    // The server returns data directly in the response, not nested in a 'data' property
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // Logout user (client-side only)
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        return JSON.parse(user);
      }
      return null;
    }
    return null;
  }
};

// ===== USER SERVICES =====
export const userService = {
  // Get all users
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Check if user exists by phone number
  checkUserByPhone: async (phoneData: { phone_number: string }): Promise<ApiResponse<User> & { exists: boolean }> => {
    const response = await apiClient.post('/users/check-phone', phoneData);
    return response.data;
  },

  // Create new user
  createUser: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  // Get user history
  getUserHistory: async (userId: string): Promise<ApiResponse<UserHistory[]>> => {
    const response = await apiClient.get(`/users/${userId}/history`);
    return response.data;
  }
};

// ===== MACHINE SERVICES =====
export const machineService = {
  // Get all machines
  getAllMachines: async (): Promise<ApiResponse<Machine[]>> => {
    const response = await apiClient.get('/machines');
    return response.data;
  },

  // Get machine by ID
  getMachineById: async (machineId: string): Promise<ApiResponse<Machine>> => {
    try {
      const response = await apiClient.get(`/machines/${machineId}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return {
          success: false,
          message: 'Machine ID not found',
          error: 'not_found'
        };
      }
      throw error; // Re-throw other errors to be caught by the caller
    }
  },

  // Create new machine
  createMachine: async (machineData: Partial<Machine>): Promise<ApiResponse<Machine>> => {
    const response = await apiClient.post('/machines', machineData);
    return response.data;
  },

  // Update machine
  updateMachine: async (machineId: string, machineData: Partial<Machine>): Promise<ApiResponse<Machine>> => {
    const response = await apiClient.put(`/machines/${machineId}`, machineData);
    return response.data;
  },

  // Delete machine
  deleteMachine: async (machineId: string): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiClient.delete(`/machines/${machineId}`);
    return response.data;
  },

  // Get machine inventory
  getMachineInventory: async (machineId: string): Promise<ApiResponse<MachineIngredientInventory[]>> => {
    const response = await apiClient.get(`/machines/${machineId}/inventory`);
    return response.data;
  },

  // Update machine inventory 
  updateMachineInventory: async (
    machineId: string, 
    inventoryData: { ingredient_id: string; quantity: number }
  ): Promise<ApiResponse<MachineIngredientInventory>> => {
    const response = await apiClient.put(`/machines/${machineId}/inventory`, inventoryData);
    return response.data;
  }
};

// ===== INGREDIENT SERVICES =====
export const ingredientService = {
  // Get all ingredients
  getAllIngredients: async (): Promise<ApiResponse<Ingredient[]>> => {
    const response = await apiClient.get('/ingredients');
    return response.data;
  },

  // Get ingredient by ID
  getIngredientById: async (ingredientId: string): Promise<ApiResponse<Ingredient>> => {
    const response = await apiClient.get(`/ingredients/${ingredientId}`);
    return response.data;
  },

  // Create new ingredient
  createIngredient: async (ingredientData: Partial<Ingredient>): Promise<ApiResponse<Ingredient>> => {
    const response = await apiClient.post('/ingredients', ingredientData);
    return response.data;
  },

  // Update ingredient
  updateIngredient: async (ingredientId: string, ingredientData: Partial<Ingredient>): Promise<ApiResponse<Ingredient>> => {
    const response = await apiClient.put(`/ingredients/${ingredientId}`, ingredientData);
    return response.data;
  },

  // Delete ingredient
  deleteIngredient: async (ingredientId: string): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiClient.delete(`/ingredients/${ingredientId}`);
    return response.data;
  }
};

// ===== RECIPE INGREDIENT SERVICES =====
export const recipeIngredientService = {
  // Get all recipe ingredients
  getAllRecipeIngredients: async (): Promise<ApiResponse<RecipeIngredient[]>> => {
    const response = await apiClient.get('/recipes/ingredients');
    return response.data;
  },
  
  // Get recipe ingredients by recipe ID
  getRecipeIngredientsByRecipeId: async (recipeId: string): Promise<ApiResponse<RecipeIngredient[]>> => {
    const response = await apiClient.get(`/recipes/ingredients?recipe=${recipeId}`);
    return response.data;
  }
};

// ===== RECIPE SERVICES =====
export const recipeService = {
  // Get all recipe categories
  getAllCategories: async (): Promise<ApiResponse<RecipeCategory[]>> => {
    const response = await apiClient.get('/recipes/categories');
    return response.data;
  },

  // Create new recipe category
  createCategory: async (categoryData: Partial<RecipeCategory>): Promise<ApiResponse<RecipeCategory>> => {
    const response = await apiClient.post('/recipes/categories', categoryData);
    return response.data;
  },

  // Get all recipes
  getAllRecipes: async (): Promise<ApiResponse<Recipe[]>> => {
    const response = await apiClient.get('/recipes');
    return response.data;
  },

  // Get recipe by ID
  getRecipeById: async (recipeId: string): Promise<ApiResponse<Recipe>> => {
    const response = await apiClient.get(`/recipes/${recipeId}`);
    return response.data;
  },

  // Create new recipe
  createRecipe: async (recipeData: RecipeFormData): Promise<ApiResponse<Recipe>> => {
    const response = await apiClient.post('/recipes', recipeData);
    return response.data;
  },

  // Create recipe with image
  createRecipeWithImage: async (recipeData: RecipeFormData, imageFile: File): Promise<ApiResponse<Recipe>> => {
    // Create a FormData object
    const formData = new FormData();
    
    // Add the recipe data as a JSON string
    formData.append('recipe', JSON.stringify(recipeData));
    
    // Add the image file
    formData.append('image', imageFile);
    
    // Send the request with multipart/form-data content type (handled automatically with FormData)
    const response = await apiClient.post('/recipes/with-image', formData, {
      headers: {
        // Let the browser set the Content-Type header with the boundary
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Update recipe image
  updateRecipeImage: async (recipeId: string, imageUrl: string): Promise<ApiResponse<Recipe>> => {
    const response = await apiClient.put(`/recipes/${recipeId}/image`, { image_url: imageUrl });
    return response.data;
  },

  // Update recipe
  updateRecipe: async (recipeId: string, recipeData: RecipeFormData): Promise<ApiResponse<Recipe>> => {
    const response = await apiClient.put(`/recipes/${recipeId}`, recipeData);
    return response.data;
  },

  // Delete recipe
  deleteRecipe: async (recipeId: string): Promise<ApiResponse<Record<string, never>>> => {
    const response = await apiClient.delete(`/recipes/${recipeId}`);
    return response.data;
  }
};

// ===== ORDER SERVICES =====
export const orderService = {
  // Get all orders
  getAllOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData: Partial<Order>): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Rate order
  rateOrder: async (orderId: string, rating: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put(`/orders/${orderId}/rate`, { rating });
    return response.data;
  }
};

// ===== PAYMENT SERVICES =====
export const paymentService = {
  // Initiate payment: server responds with HTML that redirects to CCAvenue
  initiate: async (payload: {
    user_id: string;
    machine_id: string;
    recipe_id: string;
  }): Promise<string> => {
    // We need raw HTML, not JSON
    const response = await apiClient.post('/payments/init', payload, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text',
    });
    return response.data as unknown as string;
  },
};

// ===== WARNING SERVICES =====
export const warningService = {
  // Get all warnings
  getAllWarnings: async (): Promise<ApiResponse<Warning[]>> => {
    const response = await apiClient.get('/warnings');
    return response.data;
  },

  // Get warning by ID
  getWarningById: async (warningId: string): Promise<ApiResponse<Warning>> => {
    const response = await apiClient.get(`/warnings/${warningId}`);
    return response.data;
  },

  // Create new warning
  createWarning: async (warningData: Partial<Warning>): Promise<ApiResponse<Warning>> => {
    const response = await apiClient.post('/warnings', warningData);
    return response.data;
  },

  // Update warning status
  updateWarningStatus: async (warningId: string, status: 'active' | 'resolved'): Promise<ApiResponse<Warning>> => {
    const response = await apiClient.put(`/warnings/${warningId}/status`, { status });
    return response.data;
  }
}; 