import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/revenue', dashboardController.getRevenueData);

export default router;

