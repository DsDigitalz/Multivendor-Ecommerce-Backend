import { Request, Response } from 'express';
import { cartService } from './cart.service';
import { ApiResponse } from '../../utils/api-response';
import { UnauthorizedError } from '../../utils/app-error';

export class CartController {
  async getCart(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const cart = await cartService.getCart(req.user.userId);
    return ApiResponse.success(res, 'Cart retrieved successfully', cart);
  }

  async addItem(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const cart = await cartService.addItem(req.user.userId, req.body);
    return ApiResponse.success(res, 'Item added to cart', cart);
  }

  async updateItem(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const itemId = req.params.itemId as string;
    const cart = await cartService.updateItem(req.user.userId, itemId, req.body);
    return ApiResponse.success(res, 'Cart item updated', cart);
  }

  async removeItem(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const itemId = req.params.itemId as string;
    const cart = await cartService.removeItem(req.user.userId, itemId);
    return ApiResponse.success(res, 'Item removed from cart', cart);
  }

  async clearCart(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    await cartService.clearCart(req.user.userId);
    return ApiResponse.success(res, 'Cart cleared successfully');
  }
}

export const cartController = new CartController();
