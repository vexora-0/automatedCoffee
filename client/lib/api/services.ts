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
  ApiResponse
} from './types';

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
    const response = await apiClient.get(`/machines/${machineId}`);
    return response.data;
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