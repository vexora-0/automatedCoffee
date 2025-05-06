
# Coffee Machine Inventory & Recipe Availability System Documentation

## System Architecture Overview

The automated coffee system uses a client-server architecture with real-time communication via WebSockets to handle recipe availability and inventory management:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│   Client    │◄───────►│   Server    │◄───────►│  Database   │
│  (Next.js)  │         │  (Node.js)  │         │             │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
       ▲                       ▲
       │                       │
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│             │         │             │
│  WebSocket  │◄───────►│   MQTT      │
│ Connection  │         │   Broker    │
│             │         │             │
└─────────────┘         └─────────────┘
```

## Recipe Availability System

### Backend Calculation

1. **Inventory Tracking**:
   - Each machine stores its ingredient inventory in the database
   - Ingredients have quantity values representing remaining amounts

2. **Recipe Requirements**:
   - Each recipe has defined ingredient requirements
   - Requirements specify ingredient IDs and required quantities

3. **Availability Logic**:
   - Server calculates which recipes can be made based on available ingredients
   - A recipe is available if the machine has sufficient quantities of all required ingredients
   - A recipe is unavailable if any required ingredient is missing or below threshold

### Data Flow

1. **Initial Load**:
   - Client requests recipe availability via REST API (`/api/machines/[machineId]/inventory`)
   - Server queries database for machine inventory and recipe requirements
   - Server returns `availableRecipes` and `unavailableRecipes` arrays plus `missingIngredientsByRecipe`

2. **Real-time Updates**:
   - When inventory changes (via dispensing or refills), backend recalculates availability
   - Updates are emitted via WebSockets to connected clients
   - Clients update UI in real-time without page refresh

## WebSocket Implementation

### Connection Management

1. **Singleton Pattern**:
   - A global socket instance is maintained to prevent duplicate connections
   - All components share the same WebSocket connection through Zustand store

2. **Connection Establishment**:
   - `WebSocketInitializer` component initiates the connection once at app startup
   - Connection uses Socket.IO client with WebSocket transport
   - Server maintains socket rooms for each machine

3. **Resource Management**:
   - Connection attempts are limited and tracked
   - Reconnection uses exponential backoff (1s delay, maximum 5s)
   - Debouncing prevents excessive data requests (minimum 2s between requests)

### Event System

1. **Socket Events**:
   - `recipe-update`: New recipe data available
   - `machine-status-update`: Machine status changes
   - `machine-temperature-update`: Temperature changes
   - `machine-inventory-update`: Inventory quantities change
   - `recipe-availability-update`: Recipe availability status changes
   - `error`: Server error events

2. **Room-based Broadcasting**:
   - Clients join machine-specific rooms: `join-machine` event
   - Updates are broadcast only to clients in relevant rooms
   - Clients leave rooms when no longer needed: `leave-machine` event

### State Management

1. **Zustand Stores**:
   - `useWebSocketStore`: Manages socket connection and event listeners
   - `useMachineInventoryStore`: Tracks machine ingredient quantities 
   - `useRecipeStore`: Manages recipe data
   - `useRecipeAvailabilityStore`: Tracks which recipes are available/unavailable

2. **Dynamic Store Updates**:
   - WebSocket events trigger store updates
   - Components automatically re-render when relevant store state changes

## Fallback Mechanisms

1. **API Fallback**:
   - If WebSocket connection fails, system falls back to REST API
   - Initial data always loaded via API to ensure data availability
   - WebSockets provide real-time updates when available

2. **Connection Recovery**:
   - Socket.IO handles reconnection attempts automatically
   - Reconnection limits prevent excessive attempts
   - Exponential backoff reduces server load during outages

3. **Data Integrity**:
   - Server is the source of truth for availability status
   - Client state is refreshed on reconnection
   - Client can request full data refresh via `request-data` event

## Error Handling

1. **Connection Errors**:
   - Failed connections are logged with detailed error messages
   - UI remains functional with potentially stale data
   - Automatic reconnection attempts with backoff strategy

2. **Data Processing Errors**:
   - Dynamic imports wrapped in try/catch blocks
   - Promise timeouts prevent hanging operations
   - Error states propagated to UI when critical

## Performance Optimizations

1. **Debouncing**:
   - Frequent operations (like data requests) are debounced
   - Global flags prevent duplicate operations
   - Timestamp tracking ensures minimum intervals between operations

2. **Connection Pooling**:
   - Global socket instance shared across components
   - Prevents multiple parallel connections
   - Component mounting/unmounting doesn't affect socket connection

3. **Selective Updates**:
   - Room-based broadcasting limits message volume
   - Updates only sent to clients who need specific data
   - Clients only subscribe to events they need

## Future Improvements

1. **Offline Mode**:
   - Implement cached data for offline operation
   - Queue operations when offline for later sync

2. **Connection Quality Management**:
   - Adapt update frequency based on connection quality
   - Reduce payload size for poor connections

3. **Multi-machine Management**:
   - More efficient handling for clients monitoring multiple machines
   - Batch updates for multi-machine scenarios
