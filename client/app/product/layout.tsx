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
  const { machineInventories } = useWebSocketStore();
  const { setMachineInventory } = useMachineInventoryStore();

  useEffect(() => {
    const storedMachineId = localStorage.getItem("machineId");
    if (storedMachineId) {
      setMachineId(storedMachineId);
    }
  }, []);

  // Update machine inventory when WebSocket data changes
  useEffect(() => {
    if (machineId && machineInventories[machineId]) {
      setMachineInventory(machineId, machineInventories[machineId]);
    }
  }, [machineId, machineInventories, setMachineInventory]);

  return <>{children}</>;
}
