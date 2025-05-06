"use client"
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Recipe, MachineIngredientInventory, RecipeIngredient } from '@/lib/api/types';
import { useEffect } from 'react';

// Track global socket instance to prevent duplicate connections
let globalSocketInstance: Socket | null = null;
let connectionAttempts = 0;
let lastConnectionAttempt = 0;
const MAX_RECONNECTION_ATTEMPTS = 3;
const RECONNECTION_DELAY_BASE = 1000;
const CONNECTION_COOLDOWN = 5000; // 5 seconds between connection attempts

// Extend Window interface
declare global {
  interface Window {
    _recipeAvailabilityRequested?: boolean;
    _lastDataRequest?: {
      machineId: string;
      time: number;
    };
  }
}

// Socket event types - must match backend
export enum SocketEvents {
  RECIPE_UPDATE = 'recipe-update',
  MACHINE_STATUS_UPDATE = 'machine-status-update',
  MACHINE_TEMPERATURE_UPDATE = 'machine-temperature-update',
  MACHINE_INVENTORY_UPDATE = 'machine-inventory-update',
  REQUEST_DATA = 'request-data',
  RECIPE_INGREDIENTS_UPDATE = 'recipe-ingredients-update',
  ERROR = 'error',
  RECIPE_AVAILABILITY_UPDATE = 'recipe-availability-update'
}

// Define specific delta update type
interface StatusDelta {
  status?: string;
  location?: string;
}

// Define recipe availability data type
interface RecipeAvailabilityData {
  availableRecipes: Recipe[];
  unavailableRecipes: Recipe[];
  missingIngredientsByRecipe: Record<string, string[]>;
}

interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  machineStatuses: Record<string, { status: string; location: string }>;
  machineTemperatures: Record<string, number>;
  machineInventories: Record<string, MachineIngredientInventory[]>;
  recipes: Recipe[];
  recipeAvailabilityData: Record<string, RecipeAvailabilityData>;
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
  recipeAvailabilityData: {},
  error: null,
  
  initSocket: () => {
    const { socket } = get();
    
    // Return early if we already have a socket
    if (socket) {
      console.log('[WebSocket] Socket already exists, reusing');
      return;
    }
    
    // Use existing socket if available
    if (globalSocketInstance?.connected) {
      console.log('[WebSocket] Global socket exists and is connected, reusing');
      set({ socket: globalSocketInstance, isConnected: true });
      return;
    }
    
    // Implement connection throttling
    const now = Date.now();
    if (now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
      console.log(`[WebSocket] Connection attempt too soon, wait ${CONNECTION_COOLDOWN}ms`);
      return;
    }
    
    lastConnectionAttempt = now;
    
    // Check if we've tried to connect too many times already
    if (connectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
      console.error(`[WebSocket] Maximum connection attempts (${MAX_RECONNECTION_ATTEMPTS}) reached.`);
      setTimeout(() => {
        console.log('[WebSocket] Resetting connection attempts counter');
        connectionAttempts = 0; // Reset after cooling period
      }, RECONNECTION_DELAY_BASE * 5);
      return;
    }
    
    connectionAttempts++;
    console.log(`[WebSocket] Connection attempt ${connectionAttempts}`);
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketUrl = apiBaseUrl.replace(/\/api$/, '');
    
    // Create new socket with conservative settings
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 2,
      reconnectionDelay: RECONNECTION_DELAY_BASE,
      reconnectionDelayMax: 5000,
      timeout: 5000, // Short timeout to fail faster
      forceNew: false,
      autoConnect: true
    });
    
    socketInstance.on('connect', () => {
      console.log('[WebSocket] Connected successfully');
      set({ isConnected: true });
      connectionAttempts = 0; // Reset counter on successful connection
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed');
    });
    
    socketInstance.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      set({ isConnected: false });
    });
    
    socketInstance.on('connect_error', (error: Error) => {
      console.error(`[WebSocket] Connection error: ${error.message}`);
      set({ error: error.message });
    });
    
    socketInstance.on('error', (error: Error) => {
      console.error('[WebSocket] Socket error');
      set({ error: error.message });
    });
    
    // Handle recipe updates
    socketInstance.on(SocketEvents.RECIPE_UPDATE, (data: Recipe[]) => {
      // Ensure data is an array and has length
      if (Array.isArray(data) && data.length > 0) {
        set({ recipes: data });
        
        try {
          // Use dynamic import with proper error handling
          const importPromise = import('./useRecipeStore')
            .then((RecipeStoreModule) => {
              const RecipeStore = RecipeStoreModule.default;
              if (RecipeStore) {
                const recipeStore = RecipeStore.getState();
                if (recipeStore && recipeStore.setRecipes) {
                  recipeStore.setRecipes(data);
                }
              }
              return true; // Signal completion
            })
            .catch(() => {
              console.error('[WebSocket] Failed to import recipe store');
              return false; // Signal error
            });
            
          // Add a timeout to avoid hanging promises
          Promise.race([
            importPromise,
            new Promise(resolve => setTimeout(() => resolve(false), 2000))
          ]).catch(() => {
            console.warn('[WebSocket] Recipe update operation timed out');
          });
        } catch {
          console.error('[WebSocket] Failed to update recipe store');
        }
      } else {
        console.warn('[WebSocket] Received empty recipe data');
      }
    });
    
    // Handle recipe ingredient updates
    socketInstance.on(SocketEvents.RECIPE_INGREDIENTS_UPDATE, (data: RecipeIngredient[]) => {
      if (Array.isArray(data) && data.length > 0) {
        try {
          // Use dynamic import with proper error handling
          const importPromise = import('./useRecipeIngredientStore')
            .then((RecipeIngredientStoreModule) => {
              const RecipeIngredientStore = RecipeIngredientStoreModule.default;
              if (RecipeIngredientStore) {
                const store = RecipeIngredientStore.getState();
                if (store && store.setRecipeIngredients) {
                  store.setRecipeIngredients(data);
                }
              }
              return true;
            })
            .catch(() => {
              console.error('[WebSocket] Failed to import recipe ingredient store');
              return false;
            });
            
          // Add a timeout to avoid hanging promises
          Promise.race([
            importPromise,
            new Promise(resolve => setTimeout(() => resolve(false), 2000))
          ]).catch(() => {
            console.warn('[WebSocket] Recipe ingredient update operation timed out');
          });
        } catch {
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
            // Use dynamic import with proper error handling
            const importPromise = import('./useMachineInventoryStore')
              .then((MachineInventoryStoreModule) => {
                const MachineInventoryStore = MachineInventoryStoreModule.default;
                if (MachineInventoryStore) {
                  const inventoryStore = MachineInventoryStore.getState();
                  if (inventoryStore && inventoryStore.setMachineInventory) {
                    // Always update inventory immediately
                    inventoryStore.setMachineInventory(data.machine_id, data.inventory);
                  }
                }
                return true;
              })
              .catch(() => {
                console.error('[WebSocket] Failed to import machine inventory store');
                return false;
              });
              
            // Add a timeout to avoid hanging promises
            Promise.race([
              importPromise,
              new Promise(resolve => setTimeout(() => resolve(false), 2000))
            ]).catch(() => {
              console.warn('[WebSocket] Machine inventory update operation timed out');
            });
          } catch {
            console.error('[WebSocket] Failed to update inventory store');
          }
        }
      }
    );
    
    // Handle recipe availability updates (new handler)
    socketInstance.on(
      SocketEvents.RECIPE_AVAILABILITY_UPDATE,
      (data: { 
        machine_id: string; 
        availableRecipes: Recipe[]; 
        unavailableRecipes: Recipe[];
        missingIngredientsByRecipe: Record<string, string[]>;
      }) => {
        if (data.machine_id) {
          try {
            // Use dynamic import with proper error handling
            const importPromise = import('./useRecipeAvailabilityStore')
              .then((RecipeAvailabilityStoreModule) => {
                const RecipeAvailabilityStore = RecipeAvailabilityStoreModule.default;
                if (RecipeAvailabilityStore) {
                  const availabilityStore = RecipeAvailabilityStore.getState();
                  
                  if (availabilityStore) {
                    // Call updateFromWebSocket instead of setting state directly
                    if (availabilityStore.updateFromWebSocket) {
                      availabilityStore.updateFromWebSocket(data.machine_id, {
                        availableRecipes: data.availableRecipes || [],
                        unavailableRecipes: data.unavailableRecipes || [],
                        missingIngredientsByRecipe: data.missingIngredientsByRecipe || {}
                      });
                    }
                    
                    console.log(`[WebSocket] Recipe availability updated for machine ${data.machine_id}:`,
                                `${data.availableRecipes?.length || 0} available,`,
                                `${data.unavailableRecipes?.length || 0} unavailable`);
                  }
                }
                return true;
              })
              .catch(() => {
                console.error('[WebSocket] Failed to import recipe availability store');
                return false;
              });
              
            // Add a timeout to avoid hanging promises
            Promise.race([
              importPromise,
              new Promise(resolve => setTimeout(() => resolve(false), 2000))
            ]).catch(() => {
              console.warn('[WebSocket] Recipe availability update operation timed out');
            });
          } catch {
            console.error('[WebSocket] Failed to update recipe availability store');
          }
        }
      }
    );
    
    // Handle error events
    socketInstance.on(SocketEvents.ERROR, (error: { message: string }) => {
      console.error('[WebSocket] Server error');
      set({ error: error.message });
    });
    
    // Store the socket instance globally to prevent multiple connections
    globalSocketInstance = socketInstance;
    set({ socket: socketInstance });
  },
  
  disconnectSocket: () => {
    const { socket } = get();
    
    // Skip if there's no socket
    if (!socket) return;
    
    if (socket === globalSocketInstance) {
      // Don't fully disconnect the global socket, just dereference it locally
      console.log('[WebSocket] Keeping global socket, just removing reference');
      set({ socket: null, isConnected: false });
    } else {
      // This is a different socket instance, actually disconnect it
      try {
        socket.disconnect();
        console.log('[WebSocket] Socket disconnected');
      } catch (error) {
        console.error('[WebSocket] Error disconnecting socket:', error);
      } finally {
        set({ socket: null, isConnected: false });
      }
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

  requestData: (machineId: string) => {
    const { socket } = get();
    
    if (!socket) {
      console.warn('[WebSocket] Cannot request data - socket not connected');
      return;
    }
    
    // Implement debouncing to prevent excessive requests
    if (window._lastDataRequest && 
        window._lastDataRequest.machineId === machineId && 
        Date.now() - window._lastDataRequest.time < 2000) {
      console.log('[WebSocket] Skipping data request - too frequent');
      return;
    }
    
    // Set timestamp to track last request
    window._lastDataRequest = {
      machineId,
      time: Date.now()
    };
    
    socket.emit(SocketEvents.REQUEST_DATA, { machine_id: machineId });
  }
}));

// Hook to use machine data with auto-join/leave
export const useMachineData = (machineId: string) => {
  const { 
    machineStatuses, 
    machineTemperatures, 
    machineInventories,
    joinMachineRoom,
    leaveMachineRoom
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