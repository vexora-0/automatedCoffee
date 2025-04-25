"use client"
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

// Add a simple debounce mechanism to prevent excessive state updates
let computeAvailabilityTimeoutId: NodeJS.Timeout | null = null;
let lastComputeTime = 0;
const DEBOUNCE_DELAY = 1000; // 1 second

const useRecipeAvailabilityStore = create<RecipeAvailabilityStore>()(
  immer((set, get) => ({
    availableRecipeIds: new Set<string>(),
    unavailableRecipeIds: new Set<string>(),
    availableRecipeIdArray: [],
    unavailableRecipeIdArray: [],
    missingIngredientsByRecipeId: {},

    // Main computation function - computes availability for all recipes
    // This is O(n) where n is number of recipes, but each lookup after this is O(1)
    computeAvailability: (machineId) => {
      // Debounce implementation to prevent rapid successive updates
      const now = Date.now();
      if (now - lastComputeTime < DEBOUNCE_DELAY) {
        // If called too frequently, debounce
        if (computeAvailabilityTimeoutId) {
          clearTimeout(computeAvailabilityTimeoutId);
        }
        
        computeAvailabilityTimeoutId = setTimeout(() => {
          // Reset the timer and call the actual implementation
          lastComputeTime = Date.now();
          computeAvailabilityTimeoutId = null;
          console.log('[RecipeAvail] Running debounced computeAvailability');
          computeAvailabilityImpl(machineId);
        }, DEBOUNCE_DELAY);
        
        return;
      }
      
      // If not called recently, execute immediately
      lastComputeTime = now;
      computeAvailabilityImpl(machineId);
      
      // Helper function for the actual implementation
      function computeAvailabilityImpl(machineId: string) {
        set((_) => {
          console.log('[RecipeAvail] Computing availability for machine:', machineId);
          
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
          
          // Get available ingredients (log count only)
          const availableInventory = machineInventoryStore.getInventoryForMachine(machineId);
          console.log(`[RecipeAvail] Machine has ${availableInventory.length} available ingredients`);
          
          const allRecipes = recipeStore.getAllRecipes();
          console.log(`[RecipeAvail] Checking availability for ${allRecipes.length} recipes`);
          
          // Go through every recipe
          allRecipes.forEach(recipe => {
            const recipeId = recipe.recipe_id;
            const recipeIngredients = recipeIngredientStore.getIngredientsByRecipeId(recipeId);
            
            // Check each ingredient
            const missingIngredients: string[] = [];
            
            for (const ri of recipeIngredients) {
              // Debug logging to see actual values
              console.log(`[Debug] Checking recipe ${recipe.name} ingredient ${ri.ingredient_id}`);
              console.log(`[Debug] Required quantity: ${ri.quantity}`);
              const availableQuantity = machineInventoryStore.getIngredientQuantity(
                machineId,
                ri.ingredient_id
              );
              console.log(`[Debug] Available quantity: ${availableQuantity}`);
              
              const hasEnough = machineInventoryStore.hasIngredientInStock(
                machineId,
                ri.ingredient_id,
                ri.quantity
              );
              
              console.log(`[Debug] Has enough: ${hasEnough}`);
              
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
          
          console.log(`[RecipeAvail] Availability calculated: ${_.availableRecipeIdArray.length} available, ${_.unavailableRecipeIdArray.length} unavailable`);
        });
      }
    },
    
    // Update a single recipe's availability - much faster than recomputing all
    updateRecipeAvailability: (recipeId, machineId) => set((state) => {
      console.log(`[RecipeAvail] Updating single recipe: ${recipeId}`);
      
      const recipeIngredientStore = useRecipeIngredientStore.getState();
      const machineInventoryStore = useMachineInventoryStore.getState();
      const recipeStore = useRecipeStore.getState();
      const recipe = recipeStore.getRecipeById(recipeId);
      
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
      console.log(`[RecipeAvail] Updating availability for all recipes using ingredient: ${ingredientId}`);
      
      const recipeIngredientStore = useRecipeIngredientStore.getState();
      
      // Get all recipes that use this ingredient
      const affectedRecipeIds = recipeIngredientStore.getRecipeIdsByIngredientId(ingredientId);
      console.log(`[RecipeAvail] ${affectedRecipeIds.length} recipes affected by ingredient ${ingredientId}`);
      
      // Update each affected recipe
      affectedRecipeIds.forEach(recipeId => {
        // Call the individual update function for each recipe
        // Using nested mutation here which is safe within immer
        get().updateRecipeAvailability(recipeId, machineId);
      });
    }),
    
    resetAvailability: () => set((state) => {
      console.log('[RecipeAvail] Resetting availability state');
      
      state.availableRecipeIds = new Set<string>();
      state.unavailableRecipeIds = new Set<string>();
      state.availableRecipeIdArray = [];
      state.unavailableRecipeIdArray = [];
      state.missingIngredientsByRecipeId = {};
    }),
    
    // O(1) lookups
    isRecipeAvailable: (recipeId) => {
      const isAvailable = get().availableRecipeIds.has(recipeId);
      return isAvailable;
    },
    
    getAvailableRecipes: memoize<[], Recipe[]>(() => {
      // O(a) where a = number of available recipes
      const recipeStore = useRecipeStore.getState();
      const { availableRecipeIdArray } = get();
      
      const recipes = availableRecipeIdArray.map(id => recipeStore.getRecipeById(id))
        .filter(Boolean) as Recipe[]; // Filter out undefined values
      
      console.log(`[RecipeAvail] Retrieved ${recipes.length} available recipes`);
      return recipes;
    }),
    
    getUnavailableRecipes: memoize<[], Recipe[]>(() => {
      // O(u) where u = number of unavailable recipes
      const recipeStore = useRecipeStore.getState();
      const { unavailableRecipeIdArray } = get();
      
      const recipes = unavailableRecipeIdArray.map(id => recipeStore.getRecipeById(id))
        .filter(Boolean) as Recipe[]; // Filter out undefined values
      
      console.log(`[RecipeAvail] Retrieved ${recipes.length} unavailable recipes`);
      return recipes;
    }),
    
    getMissingIngredients: (recipeId) => {
      const missingIngredients = get().missingIngredientsByRecipeId[recipeId] || [];
      if (missingIngredients.length > 0) {
        console.log(`[RecipeAvail] Recipe ${recipeId} is missing ingredients: ${missingIngredients.join(', ')}`);
      }
      return missingIngredients;
    }
  }))
);

export default useRecipeAvailabilityStore; 