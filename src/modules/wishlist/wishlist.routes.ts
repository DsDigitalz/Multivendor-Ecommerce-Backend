import { Router } from 'express';
import { wishlistController } from './wishlist.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(wishlistController.getWishlist.bind(wishlistController)));
router.post('/:productId', asyncHandler(wishlistController.addToWishlist.bind(wishlistController)));
router.delete('/:productId', asyncHandler(wishlistController.removeFromWishlist.bind(wishlistController)));
router.delete('/', asyncHandler(wishlistController.clearWishlist.bind(wishlistController)));

export const wishlistRoutes = router;
