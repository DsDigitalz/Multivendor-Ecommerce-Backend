import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { createReviewSchema } from './reviews.validation';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

// Public route: Get reviews for a product
router.get('/product/:productId', asyncHandler(reviewsController.getProductReviews.bind(reviewsController)));

// Authenticated customer routes
router.post(
  '/',
  authenticate,
  validateRequest({ body: createReviewSchema }),
  asyncHandler(reviewsController.createReview.bind(reviewsController))
);

router.delete('/:id', authenticate, asyncHandler(reviewsController.deleteReview.bind(reviewsController)));

export const reviewRoutes = router;
