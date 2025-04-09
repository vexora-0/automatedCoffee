import { useWebSocketStore } from '@/app/product/stores/useWebSocketStore';

let initialized = false;

/**
 * Initialize the WebSocket connection if not already done
 * This should be called from the root layout or app component
 */
export const initializeWebSocket = () => {
  if (initialized) return;
  
  const { initSocket } = useWebSocketStore.getState();
  initSocket();
  initialized = true;
  
  console.log('WebSocket connection initialized');
};

/**
 * Component to initialize WebSocket connection
 * Usage: <WebSocketInitializer />
 */
export const WebSocketInitializer = () => {
  initializeWebSocket();
  return null; // This component doesn't render anything
}; 