import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { ApiResponse } from '../../utils/api-response';

export class AdminController {
  async getMetrics(_req: Request, res: Response): Promise<Response> {
    const stats = await adminService.getDashboardMetrics();
    return ApiResponse.success(res, 'Admin metrics retrieved successfully', stats);
  }

  async updateVendorApproval(req: Request, res: Response): Promise<Response> {
    const vendorId = req.params.vendorId as string;
    const vendor = await adminService.updateVendorApproval(vendorId, req.body);
    return ApiResponse.success(res, 'Vendor approval status updated', vendor);
  }

  async updateUserRole(req: Request, res: Response): Promise<Response> {
    const userId = req.params.userId as string;
    const user = await adminService.updateUserRole(userId, req.body.role);
    return ApiResponse.success(res, 'User role updated successfully', user);
  }

  async listAllOrders(req: Request, res: Response): Promise<Response> {
    const { orders, meta } = await adminService.listAllOrders(req.query as any);
    return ApiResponse.success(res, 'All platform orders retrieved', orders, 200, meta);
  }
}

export const adminController = new AdminController();
