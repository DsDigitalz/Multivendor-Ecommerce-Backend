import { Schema, model } from 'mongoose';
import { IUser, IAddress } from './users.interface';
import { ROLES } from '../../config/constants';

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
      index: true,
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    addresses: [AddressSchema],
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUser>('User', UserSchema);
