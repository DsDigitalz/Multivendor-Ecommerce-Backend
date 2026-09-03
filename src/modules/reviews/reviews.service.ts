import { Types } from 'mongoose';
import { ReviewModel } from './reviews.model';
import { ProductModel } from '../products/products.model';
import { OrderModel } from '../orders/orders.model';
import { IReview } from './reviews.interface';
import { CreateReviewInput } from './reviews.validation';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../utils/app-error';
import { PAYMENT_STATUS, ROLES } from '../../config/constants';
import { PaginationMeta } from '../../utils/api-response';

export class ReviewsService {
  private async updateProductRatingMetrics(productId: string): Promise<void> {
    const stats = await ReviewModel.aggregate([
      { $match: { productId: new Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$productId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await ProductModel.findByIdAndUpdate(productId, {
        ratingAverage: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count,
      });
    } else {
      await ProductModel.findByIdAndUpdate(productId, {
        ratingAverage: 0,
        reviewCount: 0,
      });
    }
  }

  async createReview(userId: string, input: CreateReviewInput): Promise<IReview> {
    const product = await ProductModel.findById(input.productId);
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found');
    }

    const existingReview = await ReviewModel.findOne({
      productId: new Types.ObjectId(input.productId),
      userId: new Types.ObjectId(userId),
    });
    if (existingReview) {
      throw new ConflictError('You have already reviewed this product');
    }

    // Check if the user has purchased this product
    const verifiedOrder = await OrderModel.exists({
      customerId: new Types.ObjectId(userId),
      'subOrders.items.productId': new Types.ObjectId(input.productId),
      paymentStatus: PAYMENT_STATUS.PAID,
    });

    const review = await ReviewModel.create({
      productId: product._id,
      userId: new Types.ObjectId(userId),
      rating: input.rating,
      comment: input.comment,
      isVerifiedPurchase: Boolean(verifiedOrder),
    });

    await this.updateProductRatingMetrics(input.productId);

    return review;
  }

  async getProductReviews(
    productId: string,
    page = 1,
    limit = 20
  ): Promise<{ reviews: IReview[]; meta: PaginationMeta }> {
    const filter = { productId: new Types.ObjectId(productId) };
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      ReviewModel.find(filter)
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReviewModel.countDocuments(filter),
    ]);

    return {
      reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteReview(userId: string, role: string, reviewId: string): Promise<void> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (role !== ROLES.ADMIN && review.userId.toString() !== userId) {
      throw new ForbiddenError('You can only delete your own reviews');
    }

    const productId = review.productId.toString();
    await ReviewModel.findByIdAndDelete(reviewId);
    await this.updateProductRatingMetrics(productId);
  }
}

export const reviewsService = new ReviewsService();
