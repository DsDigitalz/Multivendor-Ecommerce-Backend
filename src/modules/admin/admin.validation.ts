import { z } from 'zod';
import { ROLES, VENDOR_STATUS, ORDER_STATUS } from '../../config/constants';

export const updateVendorApprovalSchema = z.object({
  status: z.enum([VENDOR_STATUS.APPROVED, VENDOR_STATUS.REJECTED, VENDOR_STATUS.SUSPENDED]),
  commissionRate: z.number().min(0).max(100).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum([ROLES.ADMIN, ROLES.VENDOR, ROLES.CUSTOMER]),
});

export const adminQueryOrdersSchema = z.object({
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

export type UpdateVendorApprovalInput = z.infer<typeof updateVendorApprovalSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type AdminQueryOrdersInput = z.infer<typeof adminQueryOrdersSchema>;
