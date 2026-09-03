import { Request, Response } from 'express';
import { productsService } from './products.service';
import { ApiResponse } from '../../utils/api-response';
import { UnauthorizedError } from '../../utils/app-error';

export class ProductsController {
  async createProduct(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const product = await productsService.createProduct(req.user.userId, req.body);
    return ApiResponse.created(res, 'Product created successfully', product);
  }

  async updateProduct(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const productId = req.params.id as string;
    const product = await productsService.updateProduct(
      req.user.userId,
      req.user.role,
      productId,
      req.body
    );
    return ApiResponse.success(res, 'Product updated successfully', product);
  }

  async deleteProduct(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const productId = req.params.id as string;
    await productsService.deleteProduct(req.user.userId, req.user.role, productId);
    return ApiResponse.success(res, 'Product deleted successfully');
  }

  async getProductBySlug(req: Request, res: Response): Promise<Response> {
    const slug = req.params.slug as string;
    const product = await productsService.getProductBySlug(slug);
    return ApiResponse.success(res, 'Product retrieved successfully', product);
  }

  async listProducts(req: Request, res: Response): Promise<Response> {
    const { products, meta } = await productsService.listProducts(req.query as any);
    return ApiResponse.success(res, 'Products retrieved successfully', products, 200, meta);
  }
}

export const productsController = new ProductsController();
