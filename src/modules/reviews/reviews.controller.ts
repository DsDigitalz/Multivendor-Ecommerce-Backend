import { Request, Response } from 'express';
import { reviewsService } from './reviews.service';
import { ApiResponse } from '../../utils/api-response';
import { UnauthorizedError } from '../../utils/app-error';

export class ReviewsController {
  async createReview(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const review = await reviewsService.createReview(req.user.userId, req.body);
    return ApiResponse.created(res, 'Review created successfully', review);
  }

  async getProductReviews(req: Request, res: Response): Promise<Response> {
    const productId = req.params.productId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const { reviews, meta } = await reviewsService.getProductReviews(productId, page, limit);
    return ApiResponse.success(res, 'Reviews retrieved successfully', reviews, 200, meta);
  }

  async deleteReview(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const reviewId = req.params.id as string;
    await reviewsService.deleteReview(req.user.userId, req.user.role, reviewId);
    return ApiResponse.success(res, 'Review deleted successfully');
  }
}

export const reviewsController = new ReviewsController();
