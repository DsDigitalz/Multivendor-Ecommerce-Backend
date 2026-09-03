import { Request, Response } from 'express';
import { ordersService } from './orders.service';
import { ApiResponse } from '../../utils/api-response';
import { UnauthorizedError } from '../../utils/app-error';

export class OrdersController {
  async checkout(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const order = await ordersService.checkout(req.user.userId, req.body);
    return ApiResponse.created(res, 'Order placed successfully', order);
  }

  async getCustomerOrders(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const { orders, meta } = await ordersService.getCustomerOrders(req.user.userId, page, limit);
    return ApiResponse.success(res, 'Customer orders retrieved', orders, 200, meta);
  }

  async getVendorOrders(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const { orders, meta } = await ordersService.getVendorSubOrders(req.user.userId, page, limit);
    return ApiResponse.success(res, 'Vendor orders retrieved', orders, 200, meta);
  }

  async getOrderById(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const orderId = req.params.orderId as string;
    const order = await ordersService.getOrderById(orderId, req.user.userId, req.user.role);
    return ApiResponse.success(res, 'Order retrieved successfully', order);
  }

  async updateSubOrderStatus(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const orderId = req.params.orderId as string;
    const order = await ordersService.updateSubOrderStatus(
      req.user.userId,
      req.user.role,
      orderId,
      req.body
    );
    return ApiResponse.success(res, 'Sub-order status updated', order);
  }
}

export const ordersController = new OrdersController();
