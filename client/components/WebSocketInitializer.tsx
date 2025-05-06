"use client";

import { useEffect, useRef } from "react";
import { useWebSocketStore } from "@/app/product/stores/useWebSocketStore";

export function WebSocketInitializer() {
  const initSocket = useWebSocketStore((state) => state.initSocket);
  const disconnectSocket = useWebSocketStore((state) => state.disconnectSocket);

  // Use ref to track initialization state
  const initialized = useRef(false);

  // Initialize socket connection only once
  useEffect(() => {
    if (initialized.current) return;

    console.log("[WebSocketInitializer] First load, initializing socket");
    initialized.current = true;

    try {
      initSocket();
    } catch (err) {
      console.error("[WebSocketInitializer] Failed to initialize socket:", err);
    }

    // No cleanup on normal unmounts - global socket should persist
    return () => {
      // Only disconnect when the app is actually closing/refreshing
      if (
        typeof window !== "undefined" &&
        document.visibilityState === "hidden"
      ) {
        console.log("[WebSocketInitializer] Page hidden, disconnecting socket");
        disconnectSocket();
      }
    };
  }, [initSocket, disconnectSocket]);

  return null;
}
