"use client";

import { useEffect } from "react";
import { useWebSocketStore } from "@/app/product/stores/useWebSocketStore";

export function WebSocketInitializer() {
  const initSocket = useWebSocketStore((state) => state.initSocket);
  const disconnectSocket = useWebSocketStore((state) => state.disconnectSocket);

  useEffect(() => {
    initSocket();
    return () => {
      disconnectSocket();
    };
  }, [initSocket, disconnectSocket]);

  return null;
}
