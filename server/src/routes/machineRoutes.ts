import express from 'express';
import {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineInventory,
  updateMachineInventory
} from '../controllers/machineController';

const router = express.Router();

router.route('/')
  .get(getAllMachines)
  .post(createMachine);

router.route('/:machineId')
  .get(getMachineById)
  .put(updateMachine)
  .delete(deleteMachine);

router.route('/:machineId/inventory')
  .get(getMachineInventory)
  .put(updateMachineInventory);

export default router; 