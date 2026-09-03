import { Request, Response } from 'express';
import { usersService } from './users.service';
import { ApiResponse } from '../../utils/api-response';
import { UnauthorizedError } from '../../utils/app-error';

export class UsersController {
  async getProfile(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const user = await usersService.getUserById(req.user.userId);
    return ApiResponse.success(res, 'Profile retrieved successfully', user);
  }

  async updateProfile(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const updated = await usersService.updateProfile(req.user.userId, req.body);
    return ApiResponse.success(res, 'Profile updated successfully', updated);
  }

  async addAddress(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const user = await usersService.addAddress(req.user.userId, req.body);
    return ApiResponse.success(res, 'Address added successfully', user.addresses);
  }

  async removeAddress(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const user = await usersService.removeAddress(req.user.userId, req.params.addressId as string);
    return ApiResponse.success(res, 'Address removed successfully', user.addresses);
  }
}

export const usersController = new UsersController();
