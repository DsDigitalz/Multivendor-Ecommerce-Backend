import { Router } from 'express';
import { productsController } from './products.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, queryProductsSchema } from './products.validation';
import { asyncHandler } from '../../utils/async-handler';
import { ROLES } from '../../config/constants';

const router = Router();

// Public routes
router.get(
  '/',
  validateRequest({ query: queryProductsSchema }),
  asyncHandler(productsController.listProducts.bind(productsController))
);

router.get('/:slug', asyncHandler(productsController.getProductBySlug.bind(productsController)));

// Vendor and Admin routes
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.VENDOR, ROLES.ADMIN),
  validateRequest({ body: createProductSchema }),
  asyncHandler(productsController.createProduct.bind(productsController))
);

router.patch(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.VENDOR, ROLES.ADMIN),
  validateRequest({ body: updateProductSchema }),
  asyncHandler(productsController.updateProduct.bind(productsController))
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.VENDOR, ROLES.ADMIN),
  asyncHandler(productsController.deleteProduct.bind(productsController))
);

export const productRoutes = router;
