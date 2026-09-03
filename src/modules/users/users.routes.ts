import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { updateProfileSchema, addAddressSchema } from './users.validation';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.use(authenticate);

router.get('/profile', asyncHandler(usersController.getProfile.bind(usersController)));
router.patch(
  '/profile',
  validateRequest({ body: updateProfileSchema }),
  asyncHandler(usersController.updateProfile.bind(usersController))
);
router.post(
  '/addresses',
  validateRequest({ body: addAddressSchema }),
  asyncHandler(usersController.addAddress.bind(usersController))
);
router.delete('/addresses/:addressId', asyncHandler(usersController.removeAddress.bind(usersController)));

export const userRoutes = router;
