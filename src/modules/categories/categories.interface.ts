import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentCategory?: Types.ObjectId | null;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
