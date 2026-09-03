import { Request, Response } from 'express';
import { categoriesService } from './categories.service';
import { ApiResponse } from '../../utils/api-response';

export class CategoriesController {
  async createCategory(req: Request, res: Response): Promise<Response> {
    const category = await categoriesService.createCategory(req.body);
    return ApiResponse.created(res, 'Category created successfully', category);
  }

  async getAllCategories(req: Request, res: Response): Promise<Response> {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await categoriesService.getAllCategories(includeInactive);
    return ApiResponse.success(res, 'Categories retrieved successfully', categories);
  }

  async getCategoryBySlug(req: Request, res: Response): Promise<Response> {
    const slug = req.params.slug as string;
    const category = await categoriesService.getCategoryBySlug(slug);
    return ApiResponse.success(res, 'Category retrieved successfully', category);
  }

  async updateCategory(req: Request, res: Response): Promise<Response> {
    const categoryId = req.params.id as string;
    const category = await categoriesService.updateCategory(categoryId, req.body);
    return ApiResponse.success(res, 'Category updated successfully', category);
  }

  async deleteCategory(req: Request, res: Response): Promise<Response> {
    const categoryId = req.params.id as string;
    await categoriesService.deleteCategory(categoryId);
    return ApiResponse.success(res, 'Category deleted successfully');
  }
}

export const categoriesController = new CategoriesController();
