"use client";

import { useEffect } from "react";
import { useWebSocketStore } from "@/app/product/stores/useWebSocketStore";

// Module-level: survives React Strict Mode unmount/remount so we only init once per tab
let socketInitialized = false;

export function WebSocketInitializer() {
  const initSocket = useWebSocketStore((state) => state.initSocket);
  const disconnectSocket = useWebSocketStore((state) => state.disconnectSocket);

  useEffect(() => {
    if (socketInitialized) return;
    socketInitialized = true;

    try {
      initSocket();
    } catch (err) {
      console.error("[WebSocketInitializer] Failed to initialize socket:", err);
      socketInitialized = false;
    }

    return () => {
      if (
        typeof window !== "undefined" &&
        document.visibilityState === "hidden"
      ) {
        disconnectSocket();
      }
    };
  }, [initSocket, disconnectSocket]);

  return null;
}
