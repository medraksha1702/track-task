import { Router } from 'express';
import * as serviceController from '../controllers/serviceController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import {
  createServiceSchema,
  updateServiceSchema,
  getServiceSchema,
  searchServicesSchema,
} from '../validations/service';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(createServiceSchema), serviceController.createService);
router.get('/', validate(searchServicesSchema), serviceController.getAllServices);
router.get('/:id', validate(getServiceSchema), serviceController.getService);
router.put('/:id', validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', validate(getServiceSchema), serviceController.deleteService);

export default router;

