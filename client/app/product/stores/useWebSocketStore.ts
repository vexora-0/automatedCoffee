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
    
    console.log('[WebSocket] Initializing socket connection...');
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketUrl = apiBaseUrl.replace(/\/api$/, '');
    
    console.log('[WebSocket] Using URL:', socketUrl);
    
    const healthCheckUrl = `${apiBaseUrl.replace(/\/api$/, '')}/api/health-check`;
    console.log('[WebSocket] Testing connection to:', healthCheckUrl);
    
    fetch(healthCheckUrl, { method: 'GET' })
      .then(response => {
        console.log('[WebSocket] Server reachable, status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('[WebSocket] Health check response:', JSON.stringify(data, null, 2));
      })
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
    
    // Log all emitted events
    const originalEmit = socketInstance.emit;
    socketInstance.emit = function(event: string, ...args: any[]) {
      console.log(`[WebSocket] Emitted: ${event}`);
      return originalEmit.apply(this, [event, ...args]);
    };
    
    socketInstance.on('connect', () => {
      console.log('[WebSocket] Connected successfully');
      set({ isConnected: true });
    });
    
    socketInstance.on('reconnect_attempt', (attempt) => {
      console.log(`[WebSocket] Reconnection attempt ${attempt}`);
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed after multiple attempts');
    });
    
    socketInstance.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected, reason:', reason);
      set({ isConnected: false });
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      set({ error: error.message });
    });
    
    socketInstance.on('error', (error) => {
      console.error('[WebSocket] Socket error:', error);
      set({ error: error.message });
    });
    
    // Handle recipe updates
    socketInstance.on(SocketEvents.RECIPE_UPDATE, (data: Recipe[]) => {
      console.log(`[WebSocket] Received ${data?.length || 0} recipes`);
      
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
          console.error('[WebSocket] Failed to update recipe store:', error);
        }
      } else {
        console.warn('[WebSocket] Received empty or invalid recipe data');
      }
    });
    
    // Handle recipe ingredient updates
    socketInstance.on(SocketEvents.RECIPE_INGREDIENTS_UPDATE, (data: any[]) => {
      console.log(`[WebSocket] Received ${data?.length || 0} recipe ingredients`);
      
      if (Array.isArray(data) && data.length > 0) {
        try {
          // Update the recipe ingredient store
          const RecipeIngredientStore = require('./useRecipeIngredientStore').default;
          if (RecipeIngredientStore) {
            const store = RecipeIngredientStore.getState();
            if (store && store.setRecipeIngredients) {
              store.setRecipeIngredients(data);
              // DO NOT automatically update recipe availability here
              // Let the component handle this with proper dependencies
              // This prevents infinite update loops
            }
          }
        } catch (error) {
          console.error('[WebSocket] Failed to update recipe ingredient store:', error);
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
        console.log(`[WebSocket] Received status update for machine ${data.machine_id}`);
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
        console.log(`[WebSocket] Received temperature update for machine ${data.machine_id}`);
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
        console.log(`[WebSocket] Received inventory update for machine ${data.machine_id} with ${data.inventory?.length || 0} items`);
        
        // Ensure data has machineId and inventory is an array
        if (data.machine_id && Array.isArray(data.inventory)) {
          set((state) => ({
            ...state,
            machineInventories: {
              ...state.machineInventories,
              [data.machine_id]: data.inventory,
            }
          }));
          
          try {
            // Try to update the machine inventory store directly
            const MachineInventoryStore = require('./useMachineInventoryStore').default;
            if (MachineInventoryStore) {
              const inventoryStore = MachineInventoryStore.getState();
              if (inventoryStore && inventoryStore.setMachineInventory) {
                inventoryStore.setMachineInventory(data.machine_id, data.inventory);
                
                // DO NOT automatically update recipe availability here
                // Let the component handle this with proper dependencies
                // This prevents infinite update loops
              }
            }
          } catch (error) {
            console.error('[WebSocket] Failed to update inventory store:', error);
          }
        } else {
          console.warn('[WebSocket] Received invalid inventory data');
        }
      }
    );
    
    // Handle error events
    socketInstance.on(SocketEvents.ERROR, (error) => {
      console.error('[WebSocket] Server error:', error);
      set({ error: error.message });
    });
    
    set({ socket: socketInstance });
  },
  
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      console.log('[WebSocket] Disconnecting socket...');
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
  
  joinMachineRoom: (machineId) => {
    const { socket } = get();
    if (socket && machineId) {
      console.log('[WebSocket] Joining machine room:', machineId);
      socket.emit('join-machine', machineId);
      // Request data after joining room
      get().requestData(machineId);
    }
  },
  
  leaveMachineRoom: (machineId) => {
    const { socket } = get();
    if (socket && machineId) {
      console.log('[WebSocket] Leaving machine room:', machineId);
      socket.emit('leave-machine', machineId);
    }
  },

  requestData: (machineId) => {
    const { socket } = get();
    if (socket && machineId) {
      console.log('[WebSocket] Requesting data for machine:', machineId);
      socket.emit(SocketEvents.REQUEST_DATA, { machine_id: machineId });
      
      // Set a timeout to retry if no data is received
      setTimeout(() => {
        const { recipes } = get();
        if (!recipes || recipes.length === 0) {
          console.log('[WebSocket] No data received after timeout, retrying request...');
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