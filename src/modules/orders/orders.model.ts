import { Schema, model } from 'mongoose';
import { IOrder, ISubOrder, IOrderItem } from './orders.interface';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../config/constants';

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variantSku: { type: String },
  },
  { _id: false }
);

const SubOrderSchema = new Schema<ISubOrder>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    items: [OrderItemSchema],
    subTotal: { type: Number, required: true },
    commissionRate: { type: Number, required: true, default: 10 },
    commissionAmount: { type: Number, required: true },
    vendorEarnings: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    trackingNumber: { type: String },
  },
  { _id: true }
);

const ShippingAddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subOrders: [SubOrderSchema],
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'stripe',
    },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = model<IOrder>('Order', OrderSchema);
