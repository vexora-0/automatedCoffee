"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { Recipe, MachineIngredientInventory } from "@/lib/api/types";

// Socket event types - must match backend
export enum SocketEvents {
  RECIPE_UPDATE = "recipe-update",
  MACHINE_STATUS_UPDATE = "machine-status-update",
  MACHINE_TEMPERATURE_UPDATE = "machine-temperature-update",
  MACHINE_INVENTORY_UPDATE = "machine-inventory-update",
}

// Socket context types
type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  joinMachineRoom: (machineId: string) => void;
  leaveMachineRoom: (machineId: string) => void;
  recipes: Recipe[];
  machineStatuses: Record<string, { status: string; location: string }>;
  machineTemperatures: Record<string, number>;
  machineInventories: Record<string, MachineIngredientInventory[]>;
};

// Create socket context
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinMachineRoom: () => {},
  leaveMachineRoom: () => {},
  recipes: [],
  machineStatuses: {},
  machineTemperatures: {},
  machineInventories: {},
});

// Socket provider props
type SocketProviderProps = {
  children: ReactNode;
};

// Socket provider component
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [machineStatuses, setMachineStatuses] = useState<
    Record<string, { status: string; location: string }>
  >({});
  const [machineTemperatures, setMachineTemperatures] = useState<
    Record<string, number>
  >({});
  const [machineInventories, setMachineInventories] = useState<
    Record<string, MachineIngredientInventory[]>
  >({});

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
      }
    );

    socketInstance.on("connect", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    });

    // Handle recipe updates
    socketInstance.on(SocketEvents.RECIPE_UPDATE, (data: Recipe[]) => {
      setRecipes(data);
    });

    // Handle machine status updates
    socketInstance.on(
      SocketEvents.MACHINE_STATUS_UPDATE,
      (data: { machine_id: string; status: string; location: string }) => {
        setMachineStatuses((prev) => ({
          ...prev,
          [data.machine_id]: { status: data.status, location: data.location },
        }));
      }
    );

    // Handle machine temperature updates
    socketInstance.on(
      SocketEvents.MACHINE_TEMPERATURE_UPDATE,
      (data: { machine_id: string; temperature_c: number }) => {
        setMachineTemperatures((prev) => ({
          ...prev,
          [data.machine_id]: data.temperature_c,
        }));
      }
    );

    // Handle machine inventory updates
    socketInstance.on(
      SocketEvents.MACHINE_INVENTORY_UPDATE,
      (data: {
        machine_id: string;
        inventory: MachineIngredientInventory[];
      }) => {
        setMachineInventories((prev) => ({
          ...prev,
          [data.machine_id]: data.inventory,
        }));
      }
    );

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Join a machine room to receive machine-specific updates
  const joinMachineRoom = (machineId: string) => {
    if (socket && machineId) {
      socket.emit("join-machine", machineId);
    }
  };

  // Leave a machine room
  const leaveMachineRoom = (machineId: string) => {
    if (socket && machineId) {
      socket.emit("leave-machine", machineId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinMachineRoom,
        leaveMachineRoom,
        recipes,
        machineStatuses,
        machineTemperatures,
        machineInventories,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use socket in components
export const useSocket = () => useContext(SocketContext);

// Custom hook for recipe data
export const useRecipes = () => {
  const { recipes } = useSocket();
  return recipes;
};

// Custom hook for machine status
export const useMachineStatus = (machineId: string) => {
  const { machineStatuses, joinMachineRoom, leaveMachineRoom } = useSocket();

  useEffect(() => {
    joinMachineRoom(machineId);
    return () => {
      leaveMachineRoom(machineId);
    };
  }, [machineId, joinMachineRoom, leaveMachineRoom]);

  return machineStatuses[machineId];
};

// Custom hook for machine temperature
export const useMachineTemperature = (machineId: string) => {
  const { machineTemperatures, joinMachineRoom, leaveMachineRoom } =
    useSocket();

  useEffect(() => {
    joinMachineRoom(machineId);
    return () => {
      leaveMachineRoom(machineId);
    };
  }, [machineId, joinMachineRoom, leaveMachineRoom]);

  return machineTemperatures[machineId];
};

// Custom hook for machine inventory (ingredient levels)
export const useMachineInventory = (machineId: string) => {
  const { machineInventories, joinMachineRoom, leaveMachineRoom } = useSocket();

  useEffect(() => {
    joinMachineRoom(machineId);
    return () => {
      leaveMachineRoom(machineId);
    };
  }, [machineId, joinMachineRoom, leaveMachineRoom]);

  return machineInventories[machineId];
};
