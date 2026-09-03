import { Schema, model } from 'mongoose';
import { IWishlist } from './wishlist.interface';

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const WishlistModel = model<IWishlist>('Wishlist', WishlistSchema);
