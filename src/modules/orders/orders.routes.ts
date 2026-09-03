import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { createOrderSchema, updateSubOrderStatusSchema } from './orders.validation';
import { asyncHandler } from '../../utils/async-handler';
import { ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate);

// Customer endpoints
router.post(
  '/checkout',
  validateRequest({ body: createOrderSchema }),
  asyncHandler(ordersController.checkout.bind(ordersController))
);

router.get('/my-orders', asyncHandler(ordersController.getCustomerOrders.bind(ordersController)));

// Vendor endpoints
router.get(
  '/vendor-orders',
  authorizeRoles(ROLES.VENDOR, ROLES.ADMIN),
  asyncHandler(ordersController.getVendorOrders.bind(ordersController))
);

router.patch(
  '/:orderId/sub-orders',
  authorizeRoles(ROLES.VENDOR, ROLES.ADMIN),
  validateRequest({ body: updateSubOrderStatusSchema }),
  asyncHandler(ordersController.updateSubOrderStatus.bind(ordersController))
);

// Order details by ID
router.get('/:orderId', asyncHandler(ordersController.getOrderById.bind(ordersController)));

export const orderRoutes = router;
