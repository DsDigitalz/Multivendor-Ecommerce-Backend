import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema } from './auth.validation';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.post(
  '/register',
  validateRequest({ body: registerSchema }),
  asyncHandler(authController.register.bind(authController))
);

router.post(
  '/login',
  validateRequest({ body: loginSchema }),
  asyncHandler(authController.login.bind(authController))
);

router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  asyncHandler(authController.refresh.bind(authController))
);

router.post('/logout', asyncHandler(authController.logout.bind(authController)));

router.post(
  '/change-password',
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword.bind(authController))
);

export const authRoutes = router;
