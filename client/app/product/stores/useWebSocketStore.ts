"use client"
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Recipe, MachineIngredientInventory } from '@/lib/api/types';
import { useEffect, useRef } from 'react';

// Socket event types - must match backend
export enum SocketEvents {
  RECIPE_UPDATE = 'recipe-update',
  MACHINE_STATUS_UPDATE = 'machine-status-update',
  MACHINE_TEMPERATURE_UPDATE = 'machine-temperature-update',
  MACHINE_INVENTORY_UPDATE = 'machine-inventory-update',
  REQUEST_DATA = 'request-data',
  RECIPE_INGREDIENTS_UPDATE = 'recipe-ingredients-update',
  ERROR = 'error'
}

// Define specific delta update type
interface StatusDelta {
  status?: string;
  location?: string;
}

interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  machineStatuses: Record<string, { status: string; location: string }>;
  machineTemperatures: Record<string, number>;
  machineInventories: Record<string, MachineIngredientInventory[]>;
  recipes: Recipe[];
  error: string | null;
  initSocket: () => void;
  disconnectSocket: () => void;
  joinMachineRoom: (machineId: string) => void;
  leaveMachineRoom: (machineId: string) => void;
  requestData: (machineId: string) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  machineStatuses: {},
  machineTemperatures: {},
  machineInventories: {},
  recipes: [],
  error: null,
  
  initSocket: () => {
    const { socket } = get();
    if (socket) return;
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketUrl = apiBaseUrl.replace(/\/api$/, '');
    
    const healthCheckUrl = `${apiBaseUrl.replace(/\/api$/, '')}/api/health-check`;
    
    fetch(healthCheckUrl, { method: 'GET' })
      .then(response => response.json())
      .catch(error => {
        console.error('[WebSocket] Server unreachable:', error.message);
      });
    
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    
    socketInstance.on('connect', () => {
      console.log('[WebSocket] Connected');
      set({ isConnected: true });
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed');
    });
    
    socketInstance.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected');
      set({ isConnected: false });
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error');
      set({ error: error.message });
    });
    
    socketInstance.on('error', (error) => {
      console.error('[WebSocket] Socket error');
      set({ error: error.message });
    });
    
    // Handle recipe updates
    socketInstance.on(SocketEvents.RECIPE_UPDATE, (data: Recipe[]) => {
      // Ensure data is an array and has length
      if (Array.isArray(data) && data.length > 0) {
        set({ recipes: data });
        
        try {
          // Try to update the recipe store directly for better integration
          const RecipeStore = require('./useRecipeStore').default;
          if (RecipeStore) {
            const recipeStore = RecipeStore.getState();
            if (recipeStore && recipeStore.setRecipes) {
              recipeStore.setRecipes(data);
            }
          }
        } catch (error) {
          console.error('[WebSocket] Failed to update recipe store');
        }
      } else {
        console.warn('[WebSocket] Received empty recipe data');
      }
    });
    
    // Handle recipe ingredient updates
    socketInstance.on(SocketEvents.RECIPE_INGREDIENTS_UPDATE, (data: any[]) => {
      if (Array.isArray(data) && data.length > 0) {
        try {
          // Update the recipe ingredient store
          const RecipeIngredientStore = require('./useRecipeIngredientStore').default;
          if (RecipeIngredientStore) {
            const store = RecipeIngredientStore.getState();
            if (store && store.setRecipeIngredients) {
              store.setRecipeIngredients(data);
            }
          }
        } catch (error) {
          console.error('[WebSocket] Failed to update recipe ingredient store');
        }
      }
    });
    
    // Handle machine status updates
    socketInstance.on(
      SocketEvents.MACHINE_STATUS_UPDATE,
      (data: { 
        machine_id: string; 
        delta?: StatusDelta; 
        status?: string; 
        location?: string;
        timestamp?: number;
      }) => {
        set((state) => {
          const current = state.machineStatuses[data.machine_id] || { status: '', location: '' };
          
          if (data.delta) {
            return {
              ...state,
              machineStatuses: {
                ...state.machineStatuses,
                [data.machine_id]: {
                  ...current,
                  ...data.delta
                }
              }
            };
          } else {
            return {
              ...state,
              machineStatuses: {
                ...state.machineStatuses,
                [data.machine_id]: {
                  status: data.status || current.status,
                  location: data.location || current.location
                }
              }
            };
          }
        });
      }
    );
    
    // Handle machine temperature updates
    socketInstance.on(
      SocketEvents.MACHINE_TEMPERATURE_UPDATE,
      (data: { machine_id: string; temperature_c: number }) => {
        set((state) => ({
          ...state,
          machineTemperatures: {
            ...state.machineTemperatures,
            [data.machine_id]: data.temperature_c,
          }
        }));
      }
    );
    
    // Handle machine inventory updates
    socketInstance.on(
      SocketEvents.MACHINE_INVENTORY_UPDATE,
      (data: { machine_id: string; inventory: MachineIngredientInventory[] }) => {
        if (data.inventory && Array.isArray(data.inventory)) {
          try {
            const MachineInventoryStore = require('./useMachineInventoryStore').default;
            
            if (MachineInventoryStore) {
              const inventoryStore = MachineInventoryStore.getState();
              if (inventoryStore && inventoryStore.setMachineInventory) {
                // Always update inventory immediately
                inventoryStore.setMachineInventory(data.machine_id, data.inventory);
                
                // Always update recipe availability without debouncing
                try {
                  const RecipeAvailabilityStore = require('./useRecipeAvailabilityStore').default;
                  if (RecipeAvailabilityStore) {
                    const availabilityStore = RecipeAvailabilityStore.getState();
                    if (availabilityStore && availabilityStore.computeAvailability) {
                      availabilityStore.computeAvailability(data.machine_id);
                    }
                  }
                } catch (error) {
                  console.error('[WebSocket] Failed to update recipe availability');
                }
              }
            }
          } catch (error) {
            console.error('[WebSocket] Failed to update inventory store');
          }
        }
      }
    );
    
    // Handle error events
    socketInstance.on(SocketEvents.ERROR, (error) => {
      console.error('[WebSocket] Server error');
      set({ error: error.message });
    });
    
    set({ socket: socketInstance });
  },
  
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
  
  joinMachineRoom: (machineId) => {
    const { socket } = get();
    if (socket && machineId) {
      socket.emit('join-machine', machineId);
      // Request data after joining room
      get().requestData(machineId);
    }
  },
  
  leaveMachineRoom: (machineId) => {
    const { socket } = get();
    if (socket && machineId) {
      socket.emit('leave-machine', machineId);
    }
  },

  requestData: (machineId) => {
    const { socket } = get();
    if (socket && machineId) {
      socket.emit(SocketEvents.REQUEST_DATA, { machine_id: machineId });
      
      // Set a timeout to retry if no data is received
      setTimeout(() => {
        const { recipes } = get();
        if (!recipes || recipes.length === 0) {
          socket.emit(SocketEvents.REQUEST_DATA, { machine_id: machineId });
        }
      }, 5000);
    }
  }
}));

// Hook to use machine data with auto-join/leave
export const useMachineData = (machineId: string) => {
  const { 
    machineStatuses, 
    machineTemperatures, 
    machineInventories,
    joinMachineRoom,
    leaveMachineRoom,
    requestData
  } = useWebSocketStore();
  
  // Join room on mount, leave on unmount
  useEffect(() => {
    if (machineId) {
      joinMachineRoom(machineId);
      
      // Cleanup on unmount
      return () => {
        leaveMachineRoom(machineId);
      };
    }
  }, [machineId, joinMachineRoom, leaveMachineRoom]);
  
  return {
    status: machineStatuses[machineId],
    temperature: machineTemperatures[machineId],
    inventory: machineInventories[machineId]
  };
};

export default useWebSocketStore; 