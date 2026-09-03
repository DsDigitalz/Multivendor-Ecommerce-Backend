import { Document, Types } from 'mongoose';
import { IAddress } from '../users/users.interface';
import { OrderStatus, PaymentStatus } from '../../config/constants';

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  variantSku?: string;
}

export interface ISubOrder {
  _id?: Types.ObjectId;
  vendorId: Types.ObjectId;
  items: IOrderItem[];
  subTotal: number;
  commissionRate: number;
  commissionAmount: number;
  vendorEarnings: number;
  status: OrderStatus;
  trackingNumber?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId: Types.ObjectId;
  subOrders: ISubOrder[];
  shippingAddress: IAddress;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}
