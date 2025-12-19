import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  getInvoiceSchema,
  searchInvoicesSchema,
  updatePaymentStatusSchema,
} from '../validations/invoice';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(createInvoiceSchema), invoiceController.createInvoice);
router.get('/', validate(searchInvoicesSchema), invoiceController.getAllInvoices);
router.get('/:id', validate(getInvoiceSchema), invoiceController.getInvoice);
router.put('/:id', validate(updateInvoiceSchema), invoiceController.updateInvoice);
router.patch('/:id/payment-status', validate(updatePaymentStatusSchema), invoiceController.updatePaymentStatus);
router.delete('/:id', validate(getInvoiceSchema), invoiceController.deleteInvoice);

export default router;

