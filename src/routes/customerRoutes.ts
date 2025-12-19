import { Router } from 'express';
import * as customerController from '../controllers/customerController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomerSchema,
  searchCustomersSchema,
} from '../validations/customer';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(createCustomerSchema), customerController.createCustomer);
router.get('/', validate(searchCustomersSchema), customerController.getAllCustomers);
router.get('/:id', validate(getCustomerSchema), customerController.getCustomer);
router.put('/:id', validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', validate(getCustomerSchema), customerController.deleteCustomer);

export default router;

