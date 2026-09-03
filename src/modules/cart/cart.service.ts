import { Types } from 'mongoose';
import { CartModel } from './cart.model';
import { ICart } from './cart.interface';
import { ProductModel } from '../products/products.model';
import { AddToCartInput, UpdateCartItemInput } from './cart.validation';
import { BadRequestError, NotFoundError } from '../../utils/app-error';

export class CartService {
  async getCart(userId: string): Promise<ICart> {
    let cart = await CartModel.findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId', 'name slug price salePrice images stock isActive')
      .populate('items.vendorId', 'storeName slug logo');

    if (!cart) {
      cart = await CartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
        totalAmount: 0,
      });
    }

    return cart;
  }

  async addItem(userId: string, input: AddToCartInput): Promise<ICart> {
    const product = await ProductModel.findById(input.productId);
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not available for purchase');
    }

    if (product.stock < input.quantity) {
      throw new BadRequestError(`Insufficient stock. Only ${product.stock} units available`);
    }

    let cart = await CartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      cart = new CartModel({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }

    const price = product.salePrice ?? product.price;

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === input.productId &&
        (input.variantSku ? item.variantSku === input.variantSku : !item.variantSku)
    );

    if (existingItemIndex > -1) {
      const existingItem = cart.items[existingItemIndex];
      if (existingItem) {
        const newQuantity = existingItem.quantity + input.quantity;
        if (product.stock < newQuantity) {
          throw new BadRequestError(`Cannot add more. Stock limit of ${product.stock} reached.`);
        }
        existingItem.quantity = newQuantity;
        existingItem.price = price;
      }
    } else {
      cart.items.push({
        productId: product._id,
        vendorId: product.vendorId,
        quantity: input.quantity,
        price,
        variantSku: input.variantSku,
      });
    }

    await cart.save();
    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, input: UpdateCartItemInput): Promise<ICart> {
    const cart = await CartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const item = cart.items.find((i) => i._id?.toString() === itemId);
    if (!item) {
      throw new NotFoundError('Item not found in cart');
    }

    const product = await ProductModel.findById(item.productId);
    if (!product || product.stock < input.quantity) {
      throw new BadRequestError('Requested quantity exceeds available stock');
    }

    item.quantity = input.quantity;
    await cart.save();
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<ICart> {
    const cart = await CartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    cart.items = cart.items.filter((i) => i._id?.toString() !== itemId);
    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    await CartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { items: [], totalAmount: 0 } }
    );
  }
}

export const cartService = new CartService();
