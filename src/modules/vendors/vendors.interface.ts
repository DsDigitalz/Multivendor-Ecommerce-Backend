import { Document, Types } from 'mongoose';
import { VendorStatus } from '../../config/constants';

export interface IPayoutDetails {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  routingNumber?: string;
  swiftCode?: string;
}

export interface IVendor extends Document {
  userId: Types.ObjectId;
  storeName: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: VendorStatus;
  commissionRate: number;
  contactEmail: string;
  phone?: string;
  payoutDetails?: IPayoutDetails;
  createdAt: Date;
  updatedAt: Date;
}
