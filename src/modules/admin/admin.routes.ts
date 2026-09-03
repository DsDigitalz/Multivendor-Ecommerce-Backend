import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  updateVendorApprovalSchema,
  updateUserRoleSchema,
  adminQueryOrdersSchema,
} from './admin.validation';
import { asyncHandler } from '../../utils/async-handler';
import { ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.get('/metrics', asyncHandler(adminController.getMetrics.bind(adminController)));

router.patch(
  '/vendors/:vendorId/approval',
  validateRequest({ body: updateVendorApprovalSchema }),
  asyncHandler(adminController.updateVendorApproval.bind(adminController))
);

router.patch(
  '/users/:userId/role',
  validateRequest({ body: updateUserRoleSchema }),
  asyncHandler(adminController.updateUserRole.bind(adminController))
);

router.get(
  '/orders',
  validateRequest({ query: adminQueryOrdersSchema }),
  asyncHandler(adminController.listAllOrders.bind(adminController))
);

export const adminRoutes = router;
