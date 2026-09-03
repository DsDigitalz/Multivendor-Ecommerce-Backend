import { Types } from 'mongoose';
import { VendorModel } from './vendors.model';
import { UserModel } from '../users/users.model';
import { IVendor } from './vendors.interface';
import { CreateVendorInput, UpdateVendorProfileInput, UpdateVendorStatusInput } from './vendors.validation';
import { ConflictError, NotFoundError } from '../../utils/app-error';
import { ROLES, VENDOR_STATUS } from '../../config/constants';
import { PaginationMeta } from '../../utils/api-response';

export class VendorsService {
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  async createVendor(userId: string, data: CreateVendorInput): Promise<IVendor> {
    const existingVendor = await VendorModel.findOne({ userId });
    if (existingVendor) {
      throw new ConflictError('User already has a registered vendor profile');
    }

    const slug = this.generateSlug(data.storeName);
    const slugExists = await VendorModel.findOne({ slug });
    if (slugExists) {
      throw new ConflictError('A store with this name or slug already exists');
    }

    const vendor = await VendorModel.create({
      userId: new Types.ObjectId(userId),
      storeName: data.storeName,
      slug,
      description: data.description,
      contactEmail: data.contactEmail,
      phone: data.phone,
      logo: data.logo,
      banner: data.banner,
      status: VENDOR_STATUS.PENDING,
    });

    await UserModel.findByIdAndUpdate(userId, { role: ROLES.VENDOR });

    return vendor;
  }

  async getVendorByUserId(userId: string): Promise<IVendor> {
    const vendor = await VendorModel.findOne({ userId });
    if (!vendor) {
      throw new NotFoundError('Vendor profile not found');
    }
    return vendor;
  }

  async getVendorById(vendorId: string): Promise<IVendor> {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    return vendor;
  }

  async getVendorBySlug(slug: string): Promise<IVendor> {
    const vendor = await VendorModel.findOne({ slug, status: VENDOR_STATUS.APPROVED });
    if (!vendor) {
      throw new NotFoundError('Approved store not found');
    }
    return vendor;
  }

  async updateVendorProfile(userId: string, data: UpdateVendorProfileInput): Promise<IVendor> {
    const vendor = await this.getVendorByUserId(userId);

    if (data.storeName && data.storeName !== vendor.storeName) {
      const newSlug = this.generateSlug(data.storeName);
      const existingSlug = await VendorModel.findOne({ slug: newSlug, _id: { $ne: vendor._id } });
      if (existingSlug) {
        throw new ConflictError('A store with this name already exists');
      }
      vendor.storeName = data.storeName;
      vendor.slug = newSlug;
    }

    if (data.description !== undefined) vendor.description = data.description;
    if (data.contactEmail !== undefined) vendor.contactEmail = data.contactEmail;
    if (data.phone !== undefined) vendor.phone = data.phone;
    if (data.logo !== undefined) vendor.logo = data.logo;
    if (data.banner !== undefined) vendor.banner = data.banner;
    if (data.payoutDetails !== undefined) vendor.payoutDetails = data.payoutDetails;

    await vendor.save();
    return vendor;
  }

  async updateVendorStatus(vendorId: string, data: UpdateVendorStatusInput): Promise<IVendor> {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    vendor.status = data.status;
    if (data.commissionRate !== undefined) {
      vendor.commissionRate = data.commissionRate;
    }

    await vendor.save();
    return vendor;
  }

  async listVendors(
    status?: string,
    page = 1,
    limit = 20
  ): Promise<{ vendors: IVendor[]; meta: PaginationMeta }> {
    const filter: Record<string, unknown> = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [vendors, total] = await Promise.all([
      VendorModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      VendorModel.countDocuments(filter),
    ]);

    return {
      vendors,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const vendorsService = new VendorsService();
