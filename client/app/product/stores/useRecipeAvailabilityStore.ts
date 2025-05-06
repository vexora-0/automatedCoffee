"use client"
import { create } from 'zustand';
import { Recipe } from '@/lib/api/types';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

// Define custom window property
declare global {
  interface Window {
    _recipeAvailabilityRequested?: boolean;
  }
}

// Define interface for recipe availability data
interface RecipeAvailabilityData {
  availableRecipes: Recipe[];
  unavailableRecipes: Recipe[];
  missingIngredientsByRecipe: Record<string, string[]>;
}

interface RecipeAvailabilityStore {
  availableRecipes: Recipe[];
  unavailableRecipes: Recipe[];
  missingIngredientsByRecipe: Record<string, string[]>;
  fetchAvailability: (machineId: string) => Promise<void>;
  subscribeToAvailability: (machineId: string) => void;
  updateFromWebSocket: (machineId: string, data: RecipeAvailabilityData) => void;
  isRecipeAvailable: (recipeId: string) => boolean;
  getMissingIngredients: (recipeId: string) => string[];
}

// Define interface for persisted state
interface PersistState {
  availableRecipes: Recipe[];
  unavailableRecipes: Recipe[];
  missingIngredientsByRecipe: Record<string, string[]>;
}

// Create the store with immer for easier state updates
const useRecipeAvailabilityStore = create<RecipeAvailabilityStore>()(
  persist(
    immer((set, get) => ({
      availableRecipes: [],
      unavailableRecipes: [],
      missingIngredientsByRecipe: {},

      fetchAvailability: async (machineId: string) => {
        try {
          console.log(`[RecipeAvailability] Fetching availability for machine: ${machineId}`);
          
          // Use environment variable for API URL or fall back to localhost:5000
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const response = await fetch(`${apiBaseUrl}/recipes/availability?machineId=${machineId}`);
          
          if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          set((state) => {
            state.availableRecipes = data.availableRecipes || [];
            state.unavailableRecipes = data.unavailableRecipes || [];
            state.missingIngredientsByRecipe = data.missingIngredientsByRecipe || {};
          });
          
          console.log('[RecipeAvailability] Updated availability from backend', data);
        } catch (error) {
          console.error('[RecipeAvailability] Error fetching availability:', error);
          
          // Don't clear state on error - keep previous state
          // But do log the error
        }
      },

      subscribeToAvailability: (machineId: string) => {
        try {
          // Use dynamic import() instead of require()
          import('./useWebSocketStore').then((WebSocketStoreModule) => {
            const WebSocketStore = WebSocketStoreModule.default;
            const wsStore = WebSocketStore.getState();
            
            if (wsStore && wsStore.socket) {
              console.log(`[RecipeAvailability] Subscribed to socket events for machine ${machineId}`);
              
              // Make sure we join the machine room to get updates
              if (wsStore.joinMachineRoom) {
                wsStore.joinMachineRoom(machineId);
                
                // Request initial data ONLY if not already done (prevent loops)
                if (wsStore.requestData) {
                  // Use a flag to prevent duplicate requests
                  if (!window._recipeAvailabilityRequested) {
                    window._recipeAvailabilityRequested = true;
                    wsStore.requestData(machineId);
                  }
                }
              }
            } else {
              console.warn('[RecipeAvailability] WebSocket not initialized, fallback to REST API');
              get().fetchAvailability(machineId);
            }
          }).catch(error => {
            console.error('[RecipeAvailability] Error importing WebSocketStore:', error);
            get().fetchAvailability(machineId);
          });
        } catch (error) {
          console.error('[RecipeAvailability] Error subscribing to availability:', error);
          // Fallback to REST API
          get().fetchAvailability(machineId);
        }
      },
      
      updateFromWebSocket: (machineId: string, data: RecipeAvailabilityData) => {
        if (!machineId || !data) return;
        
        set((state) => {
          state.availableRecipes = data.availableRecipes || [];
          state.unavailableRecipes = data.unavailableRecipes || [];
          state.missingIngredientsByRecipe = data.missingIngredientsByRecipe || {};
        });
        
        console.log(`[RecipeAvailability] Updated from WebSocket: ${data.availableRecipes?.length || 0} available, ${data.unavailableRecipes?.length || 0} unavailable recipes`);
      },

      // Utility methods
      isRecipeAvailable: (recipeId: string) => {
        const state = get();
        return state.availableRecipes.some((recipe) => recipe.recipe_id === recipeId);
      },

      getMissingIngredients: (recipeId: string) => {
        const state = get();
        return state.missingIngredientsByRecipe[recipeId] || [];
      }
    })),
    {
      name: 'recipe-availability-storage',
      partialize: (state) => ({
        availableRecipes: state.availableRecipes,
        unavailableRecipes: state.unavailableRecipes,
        missingIngredientsByRecipe: state.missingIngredientsByRecipe
      } as PersistState)
    }
  )
);

export default useRecipeAvailabilityStore; 