"use client"
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Recipe, MachineIngredientInventory } from '@/lib/api/types';
import { useEffect } from 'react';

// Socket event types - must match backend
export enum SocketEvents {
  RECIPE_UPDATE = 'recipe-update',
  MACHINE_STATUS_UPDATE = 'machine-status-update',
  MACHINE_TEMPERATURE_UPDATE = 'machine-temperature-update',
  MACHINE_INVENTORY_UPDATE = 'machine-inventory-update'
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
  initSocket: () => void;
  disconnectSocket: () => void;
  joinMachineRoom: (machineId: string) => void;
  leaveMachineRoom: (machineId: string) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  machineStatuses: {},
  machineTemperatures: {},
  machineInventories: {},
  recipes: [],
  
  initSocket: () => {
    const { socket } = get();
    if (socket) return;
    
    console.log('[WebSocket] Initializing socket connection...');
    // Get base URL without trailing /api
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketUrl = apiBaseUrl.replace(/\/api$/, '');
    
    console.log('[WebSocket] Using URL:', socketUrl);
    
    // Test the connection with a simple fetch before trying WebSocket
    // Ensure we use the correct path - the health check is at /api/health-check
    const healthCheckUrl = `${apiBaseUrl.replace(/\/api$/, '')}/api/health-check`;
    console.log('[WebSocket] Testing connection to:', healthCheckUrl);
    
    fetch(healthCheckUrl, { method: 'GET' })
      .then(response => {
        console.log('[WebSocket] Server reachable, status:', response.status);
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
    
    socketInstance.on('connect', () => {
      console.log('[WebSocket] Connected successfully, socket ID:', socketInstance.id);
      set({ isConnected: true });
    });
    
    socketInstance.on('reconnect_attempt', (attempt) => {
      console.log(`[WebSocket] Reconnection attempt ${attempt}`);
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed after multiple attempts');
      // Could implement user notification here
    });
    
    socketInstance.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      set({ isConnected: false });
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });
    
    // Handle recipe updates
    socketInstance.on(SocketEvents.RECIPE_UPDATE, (data: Recipe[]) => {
      console.log('[WebSocket] Received recipe update:', data.length, 'recipes');
      set({ recipes: data });
    });
    
    // Handle machine status updates with delta support
    socketInstance.on(
      SocketEvents.MACHINE_STATUS_UPDATE,
      (data: { 
        machine_id: string; 
        delta?: StatusDelta; 
        status?: string; 
        location?: string;
        timestamp?: number;
      }) => {
        console.log('[WebSocket] Received machine status update for:', data.machine_id);
        set((state) => {
          const current = state.machineStatuses[data.machine_id] || { status: '', location: '' };
          
          // Handle both full updates and delta updates
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
        console.log('[WebSocket] Received temperature update for:', data.machine_id, 'temp:', data.temperature_c);
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
        console.log('[WebSocket] Received inventory update for machine:', data.machine_id);
        console.log('[WebSocket] Inventory items received:', data.inventory.length);
        console.log('[WebSocket] First few items:', data.inventory.slice(0, 3));
        
        set((state) => ({
          ...state,
          machineInventories: {
            ...state.machineInventories,
            [data.machine_id]: data.inventory,
          }
        }));
      }
    );
    
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
    }
  },
  
  leaveMachineRoom: (machineId) => {
    const { socket } = get();
    if (socket && machineId) {
      console.log('[WebSocket] Leaving machine room:', machineId);
      socket.emit('leave-machine', machineId);
    }
  },
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