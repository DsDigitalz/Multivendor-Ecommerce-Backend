import { z } from 'zod';
import { ORDER_STATUS } from '../../config/constants';

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    postalCode: z.string().min(2),
  }),
  paymentMethod: z.string().default('stripe'),
});

export const updateSubOrderStatusSchema = z.object({
  subOrderId: z.string().min(1),
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ]),
  trackingNumber: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateSubOrderStatusInput = z.infer<typeof updateSubOrderStatusSchema>;
