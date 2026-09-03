import { z } from 'zod';

export const processPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentMethod: z.enum(['stripe', 'paypal', 'mock']).default('stripe'),
  transactionId: z.string().optional(),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
