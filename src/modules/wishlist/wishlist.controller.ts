import { Request, Response } from 'express';
import { wishlistService } from './wishlist.service';
import { ApiResponse } from '../../utils/api-response';
import { UnauthorizedError } from '../../utils/app-error';

export class WishlistController {
  async getWishlist(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const wishlist = await wishlistService.getWishlist(req.user.userId);
    return ApiResponse.success(res, 'Wishlist retrieved successfully', wishlist);
  }

  async addToWishlist(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const productId = req.params.productId as string;
    const wishlist = await wishlistService.addToWishlist(req.user.userId, productId);
    return ApiResponse.success(res, 'Product added to wishlist', wishlist);
  }

  async removeFromWishlist(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const productId = req.params.productId as string;
    const wishlist = await wishlistService.removeFromWishlist(req.user.userId, productId);
    return ApiResponse.success(res, 'Product removed from wishlist', wishlist);
  }

  async clearWishlist(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    await wishlistService.clearWishlist(req.user.userId);
    return ApiResponse.success(res, 'Wishlist cleared successfully');
  }
}

export const wishlistController = new WishlistController();
