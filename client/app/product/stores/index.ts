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
    // Initialize all stores
    recipeStore.setRecipes(recipes);
    ingredientStore.setIngredients(ingredients);
    recipeIngredientStore.setRecipeIngredients(recipeIngredients);
    machineInventoryStore.setMachineInventory(machineId, machineInventory);
    
    // Compute recipe availability based on current machine inventory
    recipeAvailabilityStore.computeAvailability(machineId);
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
 * Hook to update machine inventory and recompute recipe availability
 * Call this whenever inventory changes, e.g., via WebSocket updates
 * Now optimized to only update affected recipes
 */
export const useUpdateMachineInventory = (
  machineId: string,
  machineInventory: MachineIngredientInventory[] | undefined
) => {
  const machineInventoryStore = useMachineInventoryStore();
  const recipeAvailabilityStore = useRecipeAvailabilityStore();
  
  useEffect(() => {
    if (machineInventory) {
      // Track which ingredients were updated
      const updatedIngredientIds = new Set<string>();
      
      // Get current inventory for comparison
      const currentInventory = machineInventoryStore.getInventoryForMachine(machineId);
      const currentInventoryMap: Record<string, MachineIngredientInventory> = {};
      
      // Create lookup map of current inventory
      currentInventory.forEach(item => {
        currentInventoryMap[item.ingredient_id] = item;
      });
      
      // Compare with new inventory to identify changes
      machineInventory.forEach(item => {
        const currentItem = currentInventoryMap[item.ingredient_id];
        
        // If quantity changed or item is new, mark as updated
        if (!currentItem || currentItem.quantity !== item.quantity) {
          updatedIngredientIds.add(item.ingredient_id);
        }
      });
      
      // Update machine inventory
      machineInventoryStore.setMachineInventory(machineId, machineInventory);
      
      // If we have updated ingredients, only update affected recipes
      if (updatedIngredientIds.size > 0) {
        // For small updates, use targeted updates
        if (updatedIngredientIds.size <= 5) {
          updatedIngredientIds.forEach(ingredientId => {
            recipeAvailabilityStore.updateAvailabilityForIngredient(ingredientId, machineId);
          });
        } else {
          // For larger updates, recompute all (might be faster than many individual updates)
          recipeAvailabilityStore.computeAvailability(machineId);
        }
      }
    }
  }, [machineId, machineInventory, machineInventoryStore, recipeAvailabilityStore]);
};

/**
 * Hook to update a single ingredient's quantity and update affected recipes
 * For highly optimized individual inventory updates
 */
export const useUpdateIngredientQuantity = (
  machineId: string, 
  ingredientId: string, 
  quantity: number
) => {
  const machineInventoryStore = useMachineInventoryStore();
  const recipeAvailabilityStore = useRecipeAvailabilityStore();
  
  useEffect(() => {
    // Update the specific ingredient
    machineInventoryStore.updateIngredientQuantity(machineId, ingredientId, quantity);
    
    // Update only recipes affected by this ingredient
    recipeAvailabilityStore.updateAvailabilityForIngredient(ingredientId, machineId);
  }, [machineId, ingredientId, quantity, machineInventoryStore, recipeAvailabilityStore]);
}; 