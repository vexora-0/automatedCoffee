import { io } from '../server';
import { IMachine } from '../types';
import { Document } from 'mongoose';

// WebSocket event types
export enum WebSocketEvents {
  RECIPE_UPDATE = 'recipe-update',
  MACHINE_STATUS_UPDATE = 'machine-status-update',
  MACHINE_TEMPERATURE_UPDATE = 'machine-temperature-update',
  MACHINE_INVENTORY_UPDATE = 'machine-inventory-update',
  REQUEST_DATA = 'request-data',
  ERROR = 'error',
  RECIPE_AVAILABILITY_UPDATE = 'recipe-availability-update'
}

/**
 * WebSocket Service to handle emitting events to connected clients
 */
export const websocketService = {
  /**
   * Emit recipe data updates to all connected clients
   */
  emitRecipeUpdate: (recipes: any[]) => {
    io.emit(WebSocketEvents.RECIPE_UPDATE, recipes);
  },

  /**
   * Emit machine status update to specific machine room and all connected clients
   */
  emitMachineStatusUpdate: (machine: IMachine & Document) => {
    // Emit to specific machine room
    io.to(`machine-${machine.machine_id}`).emit(
      WebSocketEvents.MACHINE_STATUS_UPDATE, 
      {
        machine_id: machine.machine_id,
        status: machine.status,
        location: machine.location
      }
    );
  },

  /**
   * Emit machine status update with only changed fields (delta) to reduce payload size
   */
  emitMachineStatusUpdateDelta: (machine: IMachine & Document, changedFields: any) => {
    io.to(`machine-${machine.machine_id}`).emit(
      WebSocketEvents.MACHINE_STATUS_UPDATE, 
      {
        machine_id: machine.machine_id,
        delta: changedFields,
        timestamp: Date.now()
      }
    );
  },

  /**
   * Emit machine temperature update to specific machine room
   */
  emitMachineTemperatureUpdate: (machine: IMachine & Document) => {
    io.to(`machine-${machine.machine_id}`).emit(
      WebSocketEvents.MACHINE_TEMPERATURE_UPDATE, 
      {
        machine_id: machine.machine_id, 
        temperature_c: machine.temperature_c
      }
    );
  },

  /**
   * Emit machine temperature update with throttling for high-frequency updates
   * Only sends the most recent temperature value every 2 seconds
   */
  emitMachineTemperatureUpdateThrottled: (() => {
    const updates = new Map(); // Store latest updates per machine
    
    // Process updates every 2 seconds
    setInterval(() => {
      if (updates.size > 0) {
        for (const [machineId, data] of updates.entries()) {
          io.to(`machine-${machineId}`).emit(
            WebSocketEvents.MACHINE_TEMPERATURE_UPDATE, data);
        }
        updates.clear();
      }
    }, 2000);
    
    return (machine: IMachine & Document) => {
      updates.set(machine.machine_id, {
        machine_id: machine.machine_id, 
        temperature_c: machine.temperature_c
      });
    };
  })(),

  /**
   * Emit machine ingredient inventory update to specific machine room
   */
  emitMachineInventoryUpdate: (machineId: string, inventory: any[]) => {
    io.to(`machine-${machineId}`).emit(
      WebSocketEvents.MACHINE_INVENTORY_UPDATE, 
      {
        machine_id: machineId,
        inventory: inventory
      }
    );
  },

  /**
   * Emit recipe availability update to specific machine room
   */
  emitRecipeAvailabilityUpdate: (machineId: string, availability: any) => {
    io.to(`machine-${machineId}`).emit(
      WebSocketEvents.RECIPE_AVAILABILITY_UPDATE,
      {
        machine_id: machineId,
        ...availability
      }
    );
  }
};

export default websocketService; 