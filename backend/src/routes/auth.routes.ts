import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const router = Router();
const controller = new AuthController();

router.post('/login', validateRequest(loginSchema), controller.login.bind(controller));
router.post('/register', validateRequest(registerSchema), controller.register.bind(controller));

export default router;

