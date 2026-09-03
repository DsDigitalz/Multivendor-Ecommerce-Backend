import { Router } from 'express';
import { cartController } from './cart.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { addToCartSchema, updateCartItemSchema } from './cart.validation';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(cartController.getCart.bind(cartController)));

router.post(
  '/items',
  validateRequest({ body: addToCartSchema }),
  asyncHandler(cartController.addItem.bind(cartController))
);

router.patch(
  '/items/:itemId',
  validateRequest({ body: updateCartItemSchema }),
  asyncHandler(cartController.updateItem.bind(cartController))
);

router.delete('/items/:itemId', asyncHandler(cartController.removeItem.bind(cartController)));

router.delete('/', asyncHandler(cartController.clearCart.bind(cartController)));

export const cartRoutes = router;
