import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { userRoutes } from '../modules/users/users.routes';
import { vendorRoutes } from '../modules/vendors/vendors.routes';
import { categoryRoutes } from '../modules/categories/categories.routes';
import { productRoutes } from '../modules/products/products.routes';
import { cartRoutes } from '../modules/cart/cart.routes';
import { orderRoutes } from '../modules/orders/orders.routes';
import { paymentRoutes } from '../modules/payments/payments.routes';
import { reviewRoutes } from '../modules/reviews/reviews.routes';
import { adminRoutes } from '../modules/admin/admin.routes';
import { wishlistRoutes } from '../modules/wishlist/wishlist.routes';
import { ApiResponse } from '../utils/api-response';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  return ApiResponse.success(res, 'Multi-Vendor API is healthy', {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Domain modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/wishlist', wishlistRoutes);

export const apiRouter = router;
