import { UserModel } from '../users/users.model';
import { VendorModel } from '../vendors/vendors.model';
import { ProductModel } from '../products/products.model';
import { OrderModel } from '../orders/orders.model';
import { IAdminStats } from './admin.interface';
import { UpdateVendorApprovalInput, AdminQueryOrdersInput } from './admin.validation';
import { VENDOR_STATUS, PAYMENT_STATUS, UserRole } from '../../config/constants';
import { NotFoundError } from '../../utils/app-error';
import { PaginationMeta } from '../../utils/api-response';

export class AdminService {
  async getDashboardMetrics(): Promise<IAdminStats> {
    const [totalUsers, totalVendors, pendingVendors, totalProducts, totalOrders] =
      await Promise.all([
        UserModel.countDocuments(),
        VendorModel.countDocuments(),
        VendorModel.countDocuments({ status: VENDOR_STATUS.PENDING }),
        ProductModel.countDocuments(),
        OrderModel.countDocuments(),
      ]);

    const revenueAggregation = await OrderModel.aggregate([
      { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          subOrders: { $push: '$subOrders' },
        },
      },
    ]);

    let totalPlatformRevenue = 0;
    let totalCommissionEarned = 0;

    if (revenueAggregation.length > 0) {
      totalPlatformRevenue = revenueAggregation[0].totalRevenue || 0;
      const subOrdersArray = revenueAggregation[0].subOrders || [];
      for (const orderSubs of subOrdersArray) {
        if (Array.isArray(orderSubs)) {
          for (const so of orderSubs) {
            totalCommissionEarned += so.commissionAmount || 0;
          }
        }
      }
    }

    return {
      totalUsers,
      totalVendors,
      pendingVendors,
      totalProducts,
      totalOrders,
      totalPlatformRevenue: Math.round(totalPlatformRevenue * 100) / 100,
      totalCommissionEarned: Math.round(totalCommissionEarned * 100) / 100,
    };
  }

  async updateVendorApproval(vendorId: string, data: UpdateVendorApprovalInput) {
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

  async updateUserRole(userId: string, role: UserRole) {
    const user = await UserModel.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async listAllOrders(query: AdminQueryOrdersInput) {
    const filter = query.status ? { orderStatus: query.status } : {};
    const skip = (query.page - 1) * query.limit;

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .populate('customerId', 'name email')
        .populate('subOrders.vendorId', 'storeName slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit),
      OrderModel.countDocuments(filter),
    ]);

    return {
      orders,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}

export const adminService = new AdminService();
