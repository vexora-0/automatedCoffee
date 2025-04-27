"use client"
import { create } from 'zustand';
import { MachineIngredientInventory } from '@/lib/api/types';
import { immer } from 'zustand/middleware/immer';
import { memoize } from './utils';

interface MachineInventoryStore {
  // Normalized data for O(1) lookups
  // Store by machineId for quick access to all inventory for a machine
  inventoryByMachineId: Record<string, Record<string, MachineIngredientInventory>>;
  // Added: Flattened arrays for quick rendering
  inventoryArrayByMachineId: Record<string, MachineIngredientInventory[]>;
  isLoading: boolean;
  error: string | null;
  
  // Active machine tracking
  activeMachineId: string | null;
  
  // Actions
  setMachineInventory: (machineId: string, inventory: MachineIngredientInventory[]) => void;
  updateIngredientQuantity: (machineId: string, ingredientId: string, quantity: number) => void;
  setActiveMachine: (machineId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Selectors (constant-time lookups)
  getInventoryForMachine: (machineId: string) => MachineIngredientInventory[];
  getIngredientQuantity: (machineId: string, ingredientId: string) => number;
  getActiveInventory: () => MachineIngredientInventory[];
  hasIngredientInStock: (machineId: string, ingredientId: string, requiredQuantity: number) => boolean;
}

const useMachineInventoryStore = create<MachineInventoryStore>()(
  immer((set, get) => ({
    inventoryByMachineId: {},
    inventoryArrayByMachineId: {},
    activeMachineId: null,
    isLoading: false,
    error: null,

    // Actions
    setMachineInventory: (machineId, inventory) => set((state) => {
      // Initialize machine inventory map if not exists
      if (!state.inventoryByMachineId[machineId]) {
        state.inventoryByMachineId[machineId] = {};
      }
      
      // Create a map of ingredient_id to inventory item for O(1) lookups
      inventory.forEach((item) => {
        state.inventoryByMachineId[machineId][item.ingredient_id] = item;
      });
      
      // Store flattened array for quick access without Object.values()
      state.inventoryArrayByMachineId[machineId] = [...inventory];
      
      // Set as active machine if no active machine is set
      if (!state.activeMachineId) {
        state.activeMachineId = machineId;
      }
    }),
    
    updateIngredientQuantity: (machineId, ingredientId, quantity) => set((state) => {
      if (state.inventoryByMachineId[machineId]?.[ingredientId]) {
        // Update in the map
        state.inventoryByMachineId[machineId][ingredientId].quantity = quantity;
        
        // Also update in the array (find and update)
        const array = state.inventoryArrayByMachineId[machineId];
        if (array) {
          const index = array.findIndex(item => item.ingredient_id === ingredientId);
          if (index >= 0) {
            array[index].quantity = quantity;
          }
        }
      }
    }),
    
    setActiveMachine: (machineId) => set((state) => {
      state.activeMachineId = machineId;
    }),
    
    setLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),
    
    setError: (error) => set((state) => {
      state.error = error;
    }),
    
    // Selectors
    getInventoryForMachine: memoize<[string], MachineIngredientInventory[]>((machineId) => {
      // Return pre-computed array if available (O(1))
      const array = get().inventoryArrayByMachineId[machineId];
      if (array) return array;
      
      // Fallback to computing from map (O(n))
      const machineInventory = get().inventoryByMachineId[machineId];
      if (!machineInventory) return [];
      return Object.values(machineInventory);
    }),
    
    getIngredientQuantity: (machineId, ingredientId) => {
      return get().inventoryByMachineId[machineId]?.[ingredientId]?.quantity || 0;
    },
    
    getActiveInventory: () => {
      const { activeMachineId } = get();
      if (!activeMachineId) return [];
      return get().getInventoryForMachine(activeMachineId);
    },
    
    hasIngredientInStock: (machineId, ingredientId, requiredQuantity) => {
      const availableQuantity = get().getIngredientQuantity(machineId, ingredientId);
      return availableQuantity >= requiredQuantity;
    }
  }))
);

export default useMachineInventoryStore; 