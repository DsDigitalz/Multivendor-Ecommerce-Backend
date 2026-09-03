import { Schema, model } from 'mongoose';
import { IVendor, IPayoutDetails } from './vendors.interface';
import { VENDOR_STATUS } from '../../config/constants';

const PayoutDetailsSchema = new Schema<IPayoutDetails>(
  {
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    accountHolderName: { type: String, trim: true },
    routingNumber: { type: String, trim: true },
    swiftCode: { type: String, trim: true },
  },
  { _id: false }
);

const VendorSchema = new Schema<IVendor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    storeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String },
    logo: { type: String },
    banner: { type: String },
    status: {
      type: String,
      enum: Object.values(VENDOR_STATUS),
      default: VENDOR_STATUS.PENDING,
      index: true,
    },
    commissionRate: {
      type: Number,
      default: 10, // 10% platform fee default
      min: 0,
      max: 100,
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    payoutDetails: PayoutDetailsSchema,
  },
  {
    timestamps: true,
  }
);

export const VendorModel = model<IVendor>('Vendor', VendorSchema);
