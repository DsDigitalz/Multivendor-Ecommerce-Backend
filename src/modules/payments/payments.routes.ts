import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { processPaymentSchema } from './payments.validation';
import { asyncHandler } from '../../utils/async-handler';
import { z } from 'zod';

const router = Router();

const initializePaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentMethod: z.string().default('stripe'),
});

// Webhook endpoint (must be public so payment provider can call server-to-server)
router.post('/webhook', asyncHandler(paymentsController.handleWebhook.bind(paymentsController)));

// Public or customer verification endpoint
router.get('/verify/:reference', asyncHandler(paymentsController.verifyPayment.bind(paymentsController)));

// Authenticated customer endpoints
router.post(
  '/initialize',
  authenticate,
  validateRequest({ body: initializePaymentSchema }),
  asyncHandler(paymentsController.initializePayment.bind(paymentsController))
);

router.post(
  '/process',
  authenticate,
  validateRequest({ body: processPaymentSchema }),
  asyncHandler(paymentsController.processPayment.bind(paymentsController))
);

router.get('/:orderId', authenticate, asyncHandler(paymentsController.getPaymentByOrderId.bind(paymentsController)));

export const paymentRoutes = router;
