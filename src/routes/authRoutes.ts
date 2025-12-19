import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../validations/auth';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);

export default router;

