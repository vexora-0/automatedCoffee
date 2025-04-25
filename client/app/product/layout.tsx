"use client";

import { useEffect, useState } from "react";
import { useWebSocketStore } from "./stores/useWebSocketStore";
import useMachineInventoryStore from "./stores/useMachineInventoryStore";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [machineId, setMachineId] = useState<string | null>(null);
  const { isConnected, joinMachineRoom, recipes, machineInventories } = useWebSocketStore();
  const { setMachineInventory } = useMachineInventoryStore();

  useEffect(() => {
    const storedMachineId = localStorage.getItem("machineId");
    if (storedMachineId) {
      setMachineId(storedMachineId);
    }
  }, []);

  useEffect(() => {
    if (machineId && isConnected) {
      joinMachineRoom(machineId);
    }
  }, [machineId, isConnected, joinMachineRoom]);

  // Update machine inventory when WebSocket data changes
  useEffect(() => {
    if (machineId && machineInventories[machineId]) {
      setMachineInventory(machineId, machineInventories[machineId]);
    }
  }, [machineId, machineInventories, setMachineInventory]);

  // Log recipe data once when it changes
  useEffect(() => {
    if (recipes.length > 0) {
      console.log('[Layout] Recipe data:', {
        total: recipes.length,
        categories: [...new Set(recipes.map(r => r.category_id))].length
      });
    }
  }, [recipes]);

  return <>{children}</>;
}
