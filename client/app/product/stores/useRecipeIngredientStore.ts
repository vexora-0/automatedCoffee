import { create } from 'zustand';
import { RecipeIngredient } from '@/lib/api/types';
import { immer } from 'zustand/middleware/immer';
import { memoize } from './utils';

interface RecipeIngredientStore {
  // Normalized data for fast lookups
  // Stores ingredients by recipeId for efficient recipe-to-ingredients lookup
  ingredientsByRecipeId: Record<string, RecipeIngredient[]>;
  // Stores recipes by ingredientId for efficient ingredient-to-recipes lookup
  recipesByIngredientId: Record<string, string[]>;
  // Added: Direct O(1) lookup for specific recipe-ingredient pair
  recipeIngredientMap: Record<string, RecipeIngredient>; // "recipeId:ingredientId" -> data
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setRecipeIngredients: (recipeIngredients: RecipeIngredient[]) => void;
  addRecipeIngredient: (recipeIngredient: RecipeIngredient) => void;
  updateRecipeIngredient: (recipeId: string, ingredientId: string, updates: Partial<RecipeIngredient>) => void;
  removeRecipeIngredient: (recipeId: string, ingredientId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Selectors (constant-time lookups)
  getIngredientsByRecipeId: (recipeId: string) => RecipeIngredient[];
  getRecipeIdsByIngredientId: (ingredientId: string) => string[];
  getRecipeIngredient: (recipeId: string, ingredientId: string) => RecipeIngredient | undefined;
}

// Helper function to create a unique key for recipe-ingredient pair
const createKey = (recipeId: string, ingredientId: string): string => `${recipeId}:${ingredientId}`;

const useRecipeIngredientStore = create<RecipeIngredientStore>()(
  immer((set, get) => ({
    ingredientsByRecipeId: {},
    recipesByIngredientId: {},
    recipeIngredientMap: {},
    isLoading: false,
    error: null,

    // Actions
    setRecipeIngredients: (recipeIngredients) => set((state) => {
      // Reset state
      state.ingredientsByRecipeId = {};
      state.recipesByIngredientId = {};
      state.recipeIngredientMap = {};
      
      // Process all recipe ingredients
      recipeIngredients.forEach((ri) => {
        // Add to recipe → ingredients map
        if (!state.ingredientsByRecipeId[ri.recipe_id]) {
          state.ingredientsByRecipeId[ri.recipe_id] = [];
        }
        state.ingredientsByRecipeId[ri.recipe_id].push(ri);
        
        // Add to ingredient → recipes map
        if (!state.recipesByIngredientId[ri.ingredient_id]) {
          state.recipesByIngredientId[ri.ingredient_id] = [];
        }
        if (!state.recipesByIngredientId[ri.ingredient_id].includes(ri.recipe_id)) {
          state.recipesByIngredientId[ri.ingredient_id].push(ri.recipe_id);
        }
        
        // Add to direct lookup map
        state.recipeIngredientMap[createKey(ri.recipe_id, ri.ingredient_id)] = ri;
      });
    }),
    
    addRecipeIngredient: (ri) => set((state) => {
      // Add to recipe → ingredients map
      if (!state.ingredientsByRecipeId[ri.recipe_id]) {
        state.ingredientsByRecipeId[ri.recipe_id] = [];
      }
      
      // Check if ingredient already exists for this recipe
      const existingIndex = state.ingredientsByRecipeId[ri.recipe_id]
        .findIndex(item => item.ingredient_id === ri.ingredient_id);
      
      if (existingIndex >= 0) {
        // Update existing
        state.ingredientsByRecipeId[ri.recipe_id][existingIndex] = ri;
      } else {
        // Add new
        state.ingredientsByRecipeId[ri.recipe_id].push(ri);
      }
      
      // Add to ingredient → recipes map
      if (!state.recipesByIngredientId[ri.ingredient_id]) {
        state.recipesByIngredientId[ri.ingredient_id] = [];
      }
      if (!state.recipesByIngredientId[ri.ingredient_id].includes(ri.recipe_id)) {
        state.recipesByIngredientId[ri.ingredient_id].push(ri.recipe_id);
      }
      
      // Add to direct lookup map
      state.recipeIngredientMap[createKey(ri.recipe_id, ri.ingredient_id)] = ri;
    }),
    
    updateRecipeIngredient: (recipeId, ingredientId, updates) => set((state) => {
      // Get key for direct lookup
      const key = createKey(recipeId, ingredientId);
      
      // Update in direct lookup map - this is O(1)
      if (state.recipeIngredientMap[key]) {
        state.recipeIngredientMap[key] = {
          ...state.recipeIngredientMap[key],
          ...updates
        };
      }
      
      // Also update in the ingredients array
      if (state.ingredientsByRecipeId[recipeId]) {
        const index = state.ingredientsByRecipeId[recipeId]
          .findIndex(ri => ri.ingredient_id === ingredientId);
        
        if (index >= 0) {
          state.ingredientsByRecipeId[recipeId][index] = {
            ...state.ingredientsByRecipeId[recipeId][index],
            ...updates
          };
        }
      }
    }),
    
    removeRecipeIngredient: (recipeId, ingredientId) => set((state) => {
      // Remove from direct lookup map
      delete state.recipeIngredientMap[createKey(recipeId, ingredientId)];
      
      // Remove from recipe → ingredients map
      if (state.ingredientsByRecipeId[recipeId]) {
        const index = state.ingredientsByRecipeId[recipeId]
          .findIndex(ri => ri.ingredient_id === ingredientId);
          
        if (index >= 0) {
          state.ingredientsByRecipeId[recipeId].splice(index, 1);
        }
        
        // Remove empty arrays
        if (state.ingredientsByRecipeId[recipeId].length === 0) {
          delete state.ingredientsByRecipeId[recipeId];
        }
      }
      
      // Remove from ingredient → recipes map
      if (state.recipesByIngredientId[ingredientId]) {
        const recipeIndex = state.recipesByIngredientId[ingredientId].indexOf(recipeId);
        
        if (recipeIndex >= 0) {
          state.recipesByIngredientId[ingredientId].splice(recipeIndex, 1);
        }
        
        // Remove empty arrays
        if (state.recipesByIngredientId[ingredientId].length === 0) {
          delete state.recipesByIngredientId[ingredientId];
        }
      }
    }),
    
    setLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),
    
    setError: (error) => set((state) => {
      state.error = error;
    }),
    
    // Selectors (all O(1) lookups)
    getIngredientsByRecipeId: memoize<[string], RecipeIngredient[]>((recipeId) => {
      return get().ingredientsByRecipeId[recipeId] || [];
    }),
    
    getRecipeIdsByIngredientId: memoize<[string], string[]>((ingredientId) => {
      return get().recipesByIngredientId[ingredientId] || [];
    }),
    
    getRecipeIngredient: (recipeId, ingredientId) => {
      // Direct O(1) lookup using map
      return get().recipeIngredientMap[createKey(recipeId, ingredientId)];
    }
  }))
);

export default useRecipeIngredientStore; 