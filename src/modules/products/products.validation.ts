import { z } from 'zod';

export const createProductSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  name: z.string().min(2).max(200),
  description: z.string().min(10),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  sku: z.string().min(3).max(50),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().url()).default([]),
  variants: z
    .array(
      z.object({
        sku: z.string(),
        name: z.string(),
        price: z.number().positive(),
        stock: z.number().int().nonnegative(),
        attributes: z.record(z.string(), z.string()).default({}),
      })
    )
    .optional()
    .default([]),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const queryProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  category: z.string().optional(),
  vendor: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).default('newest'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type QueryProductsInput = z.infer<typeof queryProductsSchema>;
