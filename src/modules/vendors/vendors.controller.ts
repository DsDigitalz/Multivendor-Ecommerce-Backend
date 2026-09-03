import { Request, Response } from 'express';
import { vendorsService } from './vendors.service';
import { ApiResponse } from '../../utils/api-response';
import { UnauthorizedError } from '../../utils/app-error';

export class VendorsController {
  async register(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const vendor = await vendorsService.createVendor(req.user.userId, req.body);
    return ApiResponse.created(res, 'Vendor application submitted successfully', vendor);
  }

  async getMyStore(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const vendor = await vendorsService.getVendorByUserId(req.user.userId);
    return ApiResponse.success(res, 'Vendor profile retrieved successfully', vendor);
  }

  async getStoreBySlug(req: Request, res: Response): Promise<Response> {
    const slug = req.params.slug as string;
    const vendor = await vendorsService.getVendorBySlug(slug);
    return ApiResponse.success(res, 'Store details retrieved successfully', vendor);
  }

  async updateMyStore(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const vendor = await vendorsService.updateVendorProfile(req.user.userId, req.body);
    return ApiResponse.success(res, 'Store updated successfully', vendor);
  }

  async listVendors(req: Request, res: Response): Promise<Response> {
    const status = req.query.status as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const { vendors, meta } = await vendorsService.listVendors(status, page, limit);
    return ApiResponse.success(res, 'Vendors retrieved successfully', vendors, 200, meta);
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    const vendorId = req.params.vendorId as string;
    const vendor = await vendorsService.updateVendorStatus(vendorId, req.body);
    return ApiResponse.success(res, 'Vendor status updated successfully', vendor);
  }
}

export const vendorsController = new VendorsController();
