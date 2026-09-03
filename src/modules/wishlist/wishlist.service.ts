import { Types } from 'mongoose';
import { WishlistModel } from './wishlist.model';
import { ProductModel } from '../products/products.model';
import { IWishlist } from './wishlist.interface';
import { NotFoundError } from '../../utils/app-error';

export class WishlistService {
  async getWishlist(userId: string): Promise<IWishlist> {
    let wishlist = await WishlistModel.findOne({ userId: new Types.ObjectId(userId) }).populate(
      'products',
      'name slug price salePrice images stock ratingAverage'
    );

    if (!wishlist) {
      wishlist = await WishlistModel.create({
        userId: new Types.ObjectId(userId),
        products: [],
      });
    }

    return wishlist;
  }

  async addToWishlist(userId: string, productId: string): Promise<IWishlist> {
    const product = await ProductModel.findById(productId);
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found or unavailable');
    }

    let wishlist = await WishlistModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!wishlist) {
      wishlist = new WishlistModel({
        userId: new Types.ObjectId(userId),
        products: [],
      });
    }

    const prodObjectId = new Types.ObjectId(productId);
    const alreadyInWishlist = wishlist.products.some((id) => id.toString() === productId);

    if (!alreadyInWishlist) {
      wishlist.products.push(prodObjectId);
      await wishlist.save();
    }

    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<IWishlist> {
    const wishlist = await WishlistModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!wishlist) {
      throw new NotFoundError('Wishlist not found');
    }

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    return this.getWishlist(userId);
  }

  async clearWishlist(userId: string): Promise<void> {
    await WishlistModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { products: [] } }
    );
  }
}

export const wishlistService = new WishlistService();
