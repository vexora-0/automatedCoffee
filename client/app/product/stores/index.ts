// Export all stores
export { default as useRecipeStore } from './useRecipeStore';
export { default as useIngredientStore } from './useIngredientStore';
export { default as useRecipeIngredientStore } from './useRecipeIngredientStore';
export { default as useMachineInventoryStore } from './useMachineInventoryStore';
export { default as useRecipeAvailabilityStore } from './useRecipeAvailabilityStore';

// Export hooks for data initialization
import { useEffect } from 'react';
import { Recipe, Ingredient, RecipeIngredient, MachineIngredientInventory } from '@/lib/api/types';
import useRecipeStore from './useRecipeStore';
import useIngredientStore from './useIngredientStore';
import useRecipeIngredientStore from './useRecipeIngredientStore';
import useMachineInventoryStore from './useMachineInventoryStore';
import useRecipeAvailabilityStore from './useRecipeAvailabilityStore';

/**
 * Hook to initialize all data stores from API data
 * Call once at the top-level of your product page
 */
export const useInitializeStores = (
  recipes: Recipe[], 
  ingredients: Ingredient[], 
  recipeIngredients: RecipeIngredient[],
  machineId: string,
  machineInventory: MachineIngredientInventory[]
) => {
  const recipeStore = useRecipeStore();
  const ingredientStore = useIngredientStore();
  const recipeIngredientStore = useRecipeIngredientStore();
  const machineInventoryStore = useMachineInventoryStore();
  const recipeAvailabilityStore = useRecipeAvailabilityStore();
  
  useEffect(() => {
    console.log('[Stores] Initializing stores with data');
    console.log(`[Stores] Recipes: ${recipes.length}, Ingredients: ${ingredients.length}, Recipe-Ingredients: ${recipeIngredients.length}`);
    console.log(`[Stores] Machine ID: ${machineId}, Inventory Items: ${machineInventory.length}`);
    
    // Initialize all stores
    recipeStore.setRecipes(recipes);
    ingredientStore.setIngredients(ingredients);
    recipeIngredientStore.setRecipeIngredients(recipeIngredients);
    machineInventoryStore.setMachineInventory(machineId, machineInventory);
    
    // Fetch recipe availability from backend
    recipeAvailabilityStore.fetchAvailability(machineId);
    
    console.log('[Stores] All stores initialized');
  }, [
    recipes, 
    ingredients, 
    recipeIngredients,
    machineId,
    machineInventory,
    recipeStore,
    ingredientStore,
    recipeIngredientStore,
    machineInventoryStore,
    recipeAvailabilityStore
  ]);
  
  return {
    recipeStore,
    ingredientStore,
    recipeIngredientStore,
    machineInventoryStore,
    recipeAvailabilityStore
  };
};

/**
 * Hook to update machine inventory
 * Call this whenever inventory changes, e.g., via WebSocket updates
 * Recipe availability is now handled by the backend
 */
export const useUpdateMachineInventory = (
  machineId: string,
  machineInventory: MachineIngredientInventory[] | undefined
) => {
  const machineInventoryStore = useMachineInventoryStore();
  
  useEffect(() => {
    console.log(`[Stores] useUpdateMachineInventory called for machine: ${machineId}`);
    console.log(`[Stores] Has inventory data: ${Boolean(machineInventory)}, Items: ${machineInventory?.length || 0}`);
    
    if (machineInventory) {
      // Update machine inventory in local store for UI purposes
      machineInventoryStore.setMachineInventory(machineId, machineInventory);
      
      // Note: Recipe availability is now handled by backend via WebSocket events
      // The backend will emit 'recipe-availability-update' events that the
      // useRecipeAvailabilityStore will listen for
    } else {
      console.log('[Stores] No inventory data received, skipping update');
    }
  }, [machineId, machineInventory, machineInventoryStore]);
}; 