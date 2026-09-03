import { UserModel } from './users.model';
import { IUser, IAddress } from './users.interface';
import { NotFoundError } from '../../utils/app-error';
import { UpdateProfileInput, AddAddressInput } from './users.validation';
import { PaginationMeta } from '../../utils/api-response';

export class UsersService {
  async getUserById(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<IUser> {
    const user = await UserModel.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async addAddress(userId: string, addressData: AddAddressInput): Promise<IUser> {
    const user = await this.getUserById(userId);

    if (addressData.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(addressData as IAddress);
    await user.save();
    return user;
  }

  async removeAddress(userId: string, addressId: string): Promise<IUser> {
    const user = await this.getUserById(userId);
    user.addresses = user.addresses.filter((addr) => (addr as { _id?: { toString: () => string } })._id?.toString() !== addressId);
    await user.save();
    return user;
  }

  async listUsers(page = 1, limit = 20): Promise<{ users: IUser[]; meta: PaginationMeta }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      UserModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments(),
    ]);

    return {
      users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const usersService = new UsersService();
