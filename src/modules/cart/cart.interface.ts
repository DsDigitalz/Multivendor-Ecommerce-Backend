import { Document, Types } from 'mongoose';

export interface ICartItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  vendorId: Types.ObjectId;
  quantity: number;
  price: number;
  variantSku?: string;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
