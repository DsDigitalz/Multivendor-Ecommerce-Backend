import { Router } from 'express';
import { vendorsController } from './vendors.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { createVendorSchema, updateVendorProfileSchema, updateVendorStatusSchema } from './vendors.validation';
import { asyncHandler } from '../../utils/async-handler';
import { ROLES } from '../../config/constants';

const router = Router();

// Public routes
router.get('/', asyncHandler(vendorsController.listVendors.bind(vendorsController)));
router.get('/store/:slug', asyncHandler(vendorsController.getStoreBySlug.bind(vendorsController)));

// Authenticated vendor routes
router.post(
  '/register',
  authenticate,
  validateRequest({ body: createVendorSchema }),
  asyncHandler(vendorsController.register.bind(vendorsController))
);

router.get('/me', authenticate, asyncHandler(vendorsController.getMyStore.bind(vendorsController)));

router.patch(
  '/me',
  authenticate,
  validateRequest({ body: updateVendorProfileSchema }),
  asyncHandler(vendorsController.updateMyStore.bind(vendorsController))
);

// Admin-only route
router.patch(
  '/:vendorId/status',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateRequest({ body: updateVendorStatusSchema }),
  asyncHandler(vendorsController.updateStatus.bind(vendorsController))
);

export const vendorRoutes = router;
