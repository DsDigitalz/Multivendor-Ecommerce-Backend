import { Schema, model } from 'mongoose';
import { ICart, ICartItem } from './cart.interface';

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    variantSku: {
      type: String,
    },
  },
  { _id: true }
);

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

CartSchema.pre('save', function () {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

export const CartModel = model<ICart>('Cart', CartSchema);
