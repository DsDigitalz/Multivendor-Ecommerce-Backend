import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../../config/constants';

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  customerId: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
