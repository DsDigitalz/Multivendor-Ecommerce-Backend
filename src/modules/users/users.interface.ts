import { Document } from 'mongoose';
import { UserRole } from '../../config/constants';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}
