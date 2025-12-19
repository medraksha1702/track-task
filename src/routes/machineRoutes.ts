import { Router } from 'express';
import * as machineController from '../controllers/machineController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import {
  createMachineSchema,
  updateMachineSchema,
  getMachineSchema,
  searchMachinesSchema,
  updateStockSchema,
} from '../validations/machine';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(createMachineSchema), machineController.createMachine);
router.get('/', validate(searchMachinesSchema), machineController.getAllMachines);
router.get('/:id', validate(getMachineSchema), machineController.getMachine);
router.put('/:id', validate(updateMachineSchema), machineController.updateMachine);
router.patch('/:id/stock', validate(updateStockSchema), machineController.updateStock);
router.delete('/:id', validate(getMachineSchema), machineController.deleteMachine);

export default router;

