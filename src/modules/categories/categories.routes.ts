import { Router } from 'express';
import { categoriesController } from './categories.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema } from './categories.validation';
import { asyncHandler } from '../../utils/async-handler';
import { ROLES } from '../../config/constants';

const router = Router();

// Public routes
router.get('/', asyncHandler(categoriesController.getAllCategories.bind(categoriesController)));
router.get('/:slug', asyncHandler(categoriesController.getCategoryBySlug.bind(categoriesController)));

// Admin-only management routes
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateRequest({ body: createCategorySchema }),
  asyncHandler(categoriesController.createCategory.bind(categoriesController))
);

router.patch(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateRequest({ body: updateCategorySchema }),
  asyncHandler(categoriesController.updateCategory.bind(categoriesController))
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  asyncHandler(categoriesController.deleteCategory.bind(categoriesController))
);

export const categoryRoutes = router;
