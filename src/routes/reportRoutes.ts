import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/summary', reportController.getReport);
router.get('/upcoming-services', reportController.getUpcomingServices);
router.get('/overdue-invoices', reportController.getOverdueInvoices);

export default router;

