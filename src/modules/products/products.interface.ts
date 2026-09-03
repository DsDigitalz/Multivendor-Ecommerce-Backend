import { Document, Types } from 'mongoose';

export interface IProductVariant {
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface IProduct extends Document {
  vendorId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  images: string[];
  variants: IProductVariant[];
  ratingAverage: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
