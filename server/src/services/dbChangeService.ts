import Machine from '../models/Machine';
import Recipe from '../models/Recipe';
import MachineIngredientInventory from '../models/MachineIngredientInventory';
import websocketService from './websocketService';

// MongoDB change stream types
interface ChangeEvent {
  operationType: 'insert' | 'update' | 'delete';
  documentKey: { _id: string; machine_id?: string };
  updateDescription?: { updatedFields: Record<string, any> };
  fullDocument?: any;
}

/**
 * Initialize MongoDB change streams to automatically broadcast data changes via WebSockets
 * @throws {Error} If change streams are not supported in the current MongoDB deployment
 */
export const initChangeStreams = async () => {
  try {
    // Set up machine status/temperature change stream
    const machineStream = Machine.watch();
    machineStream.on('change', async (change: ChangeEvent) => {
      if (change.operationType === 'update') {
        const machine = await Machine.findById(change.documentKey._id);
        if (!machine) return;
        
        // Only emit what changed to reduce payload size
        if (change.updateDescription?.updatedFields?.status) {
          websocketService.emitMachineStatusUpdateDelta(machine, {
            status: machine.status
          });
        }
        if (change.updateDescription?.updatedFields?.temperature_c) {
          websocketService.emitMachineTemperatureUpdateThrottled(machine);
        }
      }
    });
    machineStream.on('error', (error: any) => {
      console.error('Error in machine change stream:', error);
    });

    // Recipe change stream
    const recipeStream = Recipe.watch();
    recipeStream.on('change', async () => {
      const recipes = await Recipe.find({}).lean();
      websocketService.emitRecipeUpdate(recipes);
    });
    recipeStream.on('error', (error: any) => {
      console.error('Error in recipe change stream:', error);
    });

    // Inventory change stream
    const inventoryStream = MachineIngredientInventory.watch();
    inventoryStream.on('change', async (change: ChangeEvent) => {
      if (['update', 'insert', 'delete'].includes(change.operationType)) {
        // Extract machine ID based on operation type
        let machineId;
        if (change.operationType === 'delete') {
          machineId = change.documentKey.machine_id;
        } else {
          machineId = change.fullDocument?.machine_id;
        }
        
        if (machineId) {
          const inventory = await MachineIngredientInventory.find({ machine_id: machineId }).lean();
          websocketService.emitMachineInventoryUpdate(machineId, inventory);
        }
      }
    });
    inventoryStream.on('error', (error: any) => {
      console.error('Error in inventory change stream:', error);
    });
  } catch (error) {
    console.error('Failed to initialize change streams:', error);
    throw new Error('Change streams not supported in current MongoDB deployment');
  }
};

export default { initChangeStreams }; 