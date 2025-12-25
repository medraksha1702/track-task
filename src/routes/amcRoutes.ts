import { Router } from 'express';
import * as amcController from '../controllers/amcController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import {
  createAMCSchema,
  updateAMCSchema,
  getAMCSchema,
  searchAMCSchema,
} from '../validations/amc';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(createAMCSchema), amcController.createAMC);
router.get('/', validate(searchAMCSchema), amcController.getAllAMCs);
router.get('/stats', amcController.getAMCStats);
router.get('/expiring', amcController.getExpiringAMCs);
router.post('/:id/send-reminder', validate(getAMCSchema), amcController.sendRenewalReminder);
router.get('/:id', validate(getAMCSchema), amcController.getAMC);
router.put('/:id', validate(updateAMCSchema), amcController.updateAMC);
router.delete('/:id', validate(getAMCSchema), amcController.deleteAMC);

export default router;

