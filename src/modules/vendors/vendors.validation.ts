import { z } from 'zod';
import { VENDOR_STATUS } from '../../config/constants';

export const createVendorSchema = z.object({
  storeName: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  contactEmail: z.string().email(),
  phone: z.string().optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
});

export const updateVendorProfileSchema = z.object({
  storeName: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  contactEmail: z.string().email().optional(),
  phone: z.string().optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
  payoutDetails: z
    .object({
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      accountHolderName: z.string().optional(),
      routingNumber: z.string().optional(),
      swiftCode: z.string().optional(),
    })
    .optional(),
});

export const updateVendorStatusSchema = z.object({
  status: z.enum([
    VENDOR_STATUS.PENDING,
    VENDOR_STATUS.APPROVED,
    VENDOR_STATUS.REJECTED,
    VENDOR_STATUS.SUSPENDED,
  ]),
  commissionRate: z.number().min(0).max(100).optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>;
export type UpdateVendorStatusInput = z.infer<typeof updateVendorStatusSchema>;
