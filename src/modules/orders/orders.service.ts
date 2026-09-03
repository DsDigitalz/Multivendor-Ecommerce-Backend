import { Types } from 'mongoose';
import { OrderModel } from './orders.model';
import { CartModel } from '../cart/cart.model';
import { ProductModel } from '../products/products.model';
import { VendorModel } from '../vendors/vendors.model';
import { IOrder, ISubOrder } from './orders.interface';
import { CreateOrderInput, UpdateSubOrderStatusInput } from './orders.validation';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/app-error';
import { ORDER_STATUS, PAYMENT_STATUS, ROLES } from '../../config/constants';
import { PaginationMeta } from '../../utils/api-response';

export class OrdersService {
  async checkout(customerId: string, input: CreateOrderInput): Promise<IOrder> {
    const cart = await CartModel.findOne({ userId: new Types.ObjectId(customerId) }).populate(
      'items.productId'
    );

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty. Cannot proceed to checkout.');
    }

    // Verify stock and collect products
    for (const item of cart.items) {
      const product = await ProductModel.findById(item.productId);
      if (!product || !product.isActive) {
        throw new BadRequestError(`Product ${item.productId} is no longer available`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestError(
          `Product ${product.name} only has ${product.stock} units left in stock`
        );
      }
    }

    // Decrement stock
    for (const item of cart.items) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Group items by vendor
    const vendorMap = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const vendorIdStr = item.vendorId.toString();
      const group = vendorMap.get(vendorIdStr) || [];
      group.push(item);
      vendorMap.set(vendorIdStr, group);
    }

    const subOrders: ISubOrder[] = [];
    let totalAmount = 0;

    for (const [vendorIdStr, items] of vendorMap.entries()) {
      const vendor = await VendorModel.findById(vendorIdStr);
      const commissionRate = vendor?.commissionRate ?? 10;

      const orderItems = items.map((i) => {
        const prod = i.productId as any;
        return {
          productId: prod._id,
          name: prod.name,
          price: i.price,
          quantity: i.quantity,
          variantSku: i.variantSku,
        };
      });

      const subTotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
      const commissionAmount = Number(((subTotal * commissionRate) / 100).toFixed(2));
      const vendorEarnings = Number((subTotal - commissionAmount).toFixed(2));

      totalAmount += subTotal;

      subOrders.push({
        vendorId: new Types.ObjectId(vendorIdStr),
        items: orderItems,
        subTotal,
        commissionRate,
        commissionAmount,
        vendorEarnings,
        status: ORDER_STATUS.PENDING,
      });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await OrderModel.create({
      orderNumber,
      customerId: new Types.ObjectId(customerId),
      subOrders,
      shippingAddress: input.shippingAddress,
      totalAmount,
      orderStatus: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      paymentMethod: input.paymentMethod,
    });

    // Clear user cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return order;
  }

  async getCustomerOrders(
    customerId: string,
    page = 1,
    limit = 20
  ): Promise<{ orders: IOrder[]; meta: PaginationMeta }> {
    const filter = { customerId: new Types.ObjectId(customerId) };
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .populate('subOrders.vendorId', 'storeName slug logo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OrderModel.countDocuments(filter),
    ]);

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVendorSubOrders(
    vendorUserId: string,
    page = 1,
    limit = 20
  ): Promise<{ orders: any[]; meta: PaginationMeta }> {
    const vendor = await VendorModel.findOne({ userId: vendorUserId });
    if (!vendor) {
      throw new ForbiddenError('Vendor profile not found');
    }

    const filter = { 'subOrders.vendorId': vendor._id };
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OrderModel.countDocuments(filter),
    ]);

    // Extract only this vendor's sub-orders
    const vendorOrders = orders.map((order) => {
      const mySubOrder = order.subOrders.find(
        (so) => so.vendorId.toString() === vendor._id.toString()
      );
      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customer: order.customerId,
        shippingAddress: order.shippingAddress,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        subOrder: mySubOrder,
      };
    });

    return {
      orders: vendorOrders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string, userId: string, role: string): Promise<IOrder> {
    const order = await OrderModel.findById(orderId)
      .populate('customerId', 'name email phone')
      .populate('subOrders.vendorId', 'storeName slug contactEmail');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (role === ROLES.CUSTOMER && order.customerId._id.toString() !== userId) {
      throw new ForbiddenError('Access denied to this order');
    }

    return order;
  }

  async updateSubOrderStatus(
    userId: string,
    role: string,
    orderId: string,
    input: UpdateSubOrderStatusInput
  ): Promise<IOrder> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const subOrder = order.subOrders.find(
      (so) => so._id?.toString() === input.subOrderId
    );

    if (!subOrder) {
      throw new NotFoundError('Sub-order not found in this order');
    }

    if (role !== ROLES.ADMIN) {
      const vendor = await VendorModel.findOne({ userId });
      if (!vendor || subOrder.vendorId.toString() !== vendor._id.toString()) {
        throw new ForbiddenError('You can only update sub-orders for your store');
      }
    }

    subOrder.status = input.status;
    if (input.trackingNumber) {
      subOrder.trackingNumber = input.trackingNumber;
    }

    // Check if all sub-orders are delivered
    const allDelivered = order.subOrders.every((so) => so.status === ORDER_STATUS.DELIVERED);
    if (allDelivered) {
      order.orderStatus = ORDER_STATUS.DELIVERED;
    } else {
      order.orderStatus = ORDER_STATUS.PROCESSING;
    }

    await order.save();
    return order;
  }
}

export const ordersService = new OrdersService();
