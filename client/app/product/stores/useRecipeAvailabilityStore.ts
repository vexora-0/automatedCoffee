import { create } from 'zustand';
import { Recipe } from '@/lib/api/types';
import { immer } from 'zustand/middleware/immer';
import useRecipeStore from './useRecipeStore';
import useRecipeIngredientStore from './useRecipeIngredientStore';
import useMachineInventoryStore from './useMachineInventoryStore';
import { memoize } from './utils';

interface RecipeAvailabilityStore {
  // Cached availability information for O(1) lookups
  availableRecipeIds: Set<string>;
  unavailableRecipeIds: Set<string>;
  // Added: Pre-built arrays for faster rendering
  availableRecipeIdArray: string[];
  unavailableRecipeIdArray: string[];
  missingIngredientsByRecipeId: Record<string, string[]>;
  
  // Actions
  computeAvailability: (machineId: string) => void;
  // Added: Update single recipe availability for faster targeted updates
  updateRecipeAvailability: (recipeId: string, machineId: string) => void;
  // Added: Update availability for recipes affected by ingredient change
  updateAvailabilityForIngredient: (ingredientId: string, machineId: string) => void;
  resetAvailability: () => void;
  
  // Selectors (all constant-time operations)
  isRecipeAvailable: (recipeId: string) => boolean;
  getAvailableRecipes: () => Recipe[];
  getUnavailableRecipes: () => Recipe[];
  getMissingIngredients: (recipeId: string) => string[];
}

const useRecipeAvailabilityStore = create<RecipeAvailabilityStore>()(
  immer((set, get) => ({
    availableRecipeIds: new Set<string>(),
    unavailableRecipeIds: new Set<string>(),
    availableRecipeIdArray: [],
    unavailableRecipeIdArray: [],
    missingIngredientsByRecipeId: {},

    // Main computation function - computes availability for all recipes
    // This is O(n) where n is number of recipes, but each lookup after this is O(1)
    computeAvailability: (machineId) => set((_) => {
      // Start fresh
      _.availableRecipeIds = new Set<string>();
      _.unavailableRecipeIds = new Set<string>();
      _.availableRecipeIdArray = [];
      _.unavailableRecipeIdArray = [];
      _.missingIngredientsByRecipeId = {};
      
      // Get all necessary stores
      const recipeStore = useRecipeStore.getState();
      const recipeIngredientStore = useRecipeIngredientStore.getState();
      const machineInventoryStore = useMachineInventoryStore.getState();
      
      // Go through every recipe
      recipeStore.getAllRecipes().forEach(recipe => {
        const recipeId = recipe.recipe_id;
        const recipeIngredients = recipeIngredientStore.getIngredientsByRecipeId(recipeId);
        
        // Check each ingredient
        const missingIngredients: string[] = [];
        
        for (const ri of recipeIngredients) {
          const hasEnough = machineInventoryStore.hasIngredientInStock(
            machineId,
            ri.ingredient_id,
            ri.quantity
          );
          
          if (!hasEnough) {
            missingIngredients.push(ri.ingredient_id);
          }
        }
        
        // Store results
        if (missingIngredients.length === 0) {
          _.availableRecipeIds.add(recipeId);
          _.availableRecipeIdArray.push(recipeId);
        } else {
          _.unavailableRecipeIds.add(recipeId);
          _.unavailableRecipeIdArray.push(recipeId);
          _.missingIngredientsByRecipeId[recipeId] = missingIngredients;
        }
      });
    }),
    
    // Update a single recipe's availability - much faster than recomputing all
    updateRecipeAvailability: (recipeId, machineId) => set((state) => {
      const recipeIngredientStore = useRecipeIngredientStore.getState();
      const machineInventoryStore = useMachineInventoryStore.getState();
      
      const recipeIngredients = recipeIngredientStore.getIngredientsByRecipeId(recipeId);
      
      // Check each ingredient
      const missingIngredients: string[] = [];
      
      for (const ri of recipeIngredients) {
        const hasEnough = machineInventoryStore.hasIngredientInStock(
          machineId,
          ri.ingredient_id,
          ri.quantity
        );
        
        if (!hasEnough) {
          missingIngredients.push(ri.ingredient_id);
        }
      }
      
      // Update sets and arrays
      if (missingIngredients.length === 0) {
        // Recipe is available
        state.unavailableRecipeIds.delete(recipeId);
        state.availableRecipeIds.add(recipeId);
        delete state.missingIngredientsByRecipeId[recipeId];
        
        // Update arrays
        const unavailableIndex = state.unavailableRecipeIdArray.indexOf(recipeId);
        if (unavailableIndex >= 0) {
          state.unavailableRecipeIdArray.splice(unavailableIndex, 1);
        }
        
        if (!state.availableRecipeIdArray.includes(recipeId)) {
          state.availableRecipeIdArray.push(recipeId);
        }
      } else {
        // Recipe is unavailable
        state.availableRecipeIds.delete(recipeId);
        state.unavailableRecipeIds.add(recipeId);
        state.missingIngredientsByRecipeId[recipeId] = missingIngredients;
        
        // Update arrays
        const availableIndex = state.availableRecipeIdArray.indexOf(recipeId);
        if (availableIndex >= 0) {
          state.availableRecipeIdArray.splice(availableIndex, 1);
        }
        
        if (!state.unavailableRecipeIdArray.includes(recipeId)) {
          state.unavailableRecipeIdArray.push(recipeId);
        }
      }
    }),
    
    // Update all recipes that use a specific ingredient
    updateAvailabilityForIngredient: (ingredientId, machineId) => set(() => {
      const recipeIngredientStore = useRecipeIngredientStore.getState();
      
      // Get all recipes that use this ingredient
      const affectedRecipeIds = recipeIngredientStore.getRecipeIdsByIngredientId(ingredientId);
      
      // Update each affected recipe
      affectedRecipeIds.forEach(recipeId => {
        // Call the individual update function for each recipe
        // Using nested mutation here which is safe within immer
        get().updateRecipeAvailability(recipeId, machineId);
      });
    }),
    
    resetAvailability: () => set((state) => {
      state.availableRecipeIds = new Set<string>();
      state.unavailableRecipeIds = new Set<string>();
      state.availableRecipeIdArray = [];
      state.unavailableRecipeIdArray = [];
      state.missingIngredientsByRecipeId = {};
    }),
    
    // O(1) lookups
    isRecipeAvailable: (recipeId) => {
      return get().availableRecipeIds.has(recipeId);
    },
    
    getAvailableRecipes: memoize<[], Recipe[]>(() => {
      // O(a) where a = number of available recipes
      const recipeStore = useRecipeStore.getState();
      const { availableRecipeIdArray } = get();
      
      return availableRecipeIdArray.map(id => recipeStore.getRecipeById(id))
        .filter(Boolean) as Recipe[]; // Filter out undefined values
    }),
    
    getUnavailableRecipes: memoize<[], Recipe[]>(() => {
      // O(u) where u = number of unavailable recipes
      const recipeStore = useRecipeStore.getState();
      const { unavailableRecipeIdArray } = get();
      
      return unavailableRecipeIdArray.map(id => recipeStore.getRecipeById(id))
        .filter(Boolean) as Recipe[]; // Filter out undefined values
    }),
    
    getMissingIngredients: (recipeId) => {
      return get().missingIngredientsByRecipeId[recipeId] || [];
    }
  }))
);

export default useRecipeAvailabilityStore; 