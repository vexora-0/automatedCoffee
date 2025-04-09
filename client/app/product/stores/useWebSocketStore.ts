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
    
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      set({ isConnected: true });
    });
    
    socketInstance.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      // Could implement user notification here
    });
    
    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      set({ isConnected: false });
    });
    
    // Handle recipe updates
    socketInstance.on(SocketEvents.RECIPE_UPDATE, (data: Recipe[]) => {
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
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
  
  joinMachineRoom: (machineId) => {
    const { socket } = get();
    if (socket && machineId) {
      socket.emit('join-machine', machineId);
    }
  },
  
  leaveMachineRoom: (machineId) => {
    const { socket } = get();
    if (socket && machineId) {
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