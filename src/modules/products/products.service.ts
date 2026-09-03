import { Types } from 'mongoose';
import { ProductModel } from './products.model';
import { VendorModel } from '../vendors/vendors.model';
import { IProduct } from './products.interface';
import { CreateProductInput, UpdateProductInput, QueryProductsInput } from './products.validation';
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from '../../utils/app-error';
import { ROLES, VENDOR_STATUS } from '../../config/constants';
import { PaginationMeta } from '../../utils/api-response';

export class ProductsService {
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  async createProduct(vendorUserId: string, data: CreateProductInput): Promise<IProduct> {
    const vendor = await VendorModel.findOne({ userId: vendorUserId });
    if (!vendor) {
      throw new ForbiddenError('You do not have a registered vendor profile');
    }

    if (vendor.status !== VENDOR_STATUS.APPROVED) {
      throw new ForbiddenError('Your vendor account is not approved yet to publish products');
    }

    const slug = `${this.generateSlug(data.name)}-${Date.now().toString(36)}`;
    const existingSku = await ProductModel.findOne({ sku: data.sku });
    if (existingSku) {
      throw new ConflictError('Product SKU must be unique across catalog');
    }

    const product = await ProductModel.create({
      ...data,
      vendorId: vendor._id,
      categoryId: new Types.ObjectId(data.categoryId),
      slug,
      variants: (data.variants || []) as any,
    });

    return product;
  }

  async updateProduct(
    userId: string,
    role: string,
    productId: string,
    data: UpdateProductInput
  ): Promise<IProduct> {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (role !== ROLES.ADMIN) {
      const vendor = await VendorModel.findOne({ userId });
      if (!vendor || product.vendorId.toString() !== vendor._id.toString()) {
        throw new ForbiddenError('You can only update your own products');
      }
    }

    if (data.sku && data.sku !== product.sku) {
      const existingSku = await ProductModel.findOne({ sku: data.sku, _id: { $ne: product._id } });
      if (existingSku) {
        throw new ConflictError('Product SKU already in use');
      }
    }

    Object.assign(product, data);
    await product.save();
    return product;
  }

  async deleteProduct(userId: string, role: string, productId: string): Promise<void> {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (role !== ROLES.ADMIN) {
      const vendor = await VendorModel.findOne({ userId });
      if (!vendor || product.vendorId.toString() !== vendor._id.toString()) {
        throw new ForbiddenError('You can only delete your own products');
      }
    }

    await ProductModel.findByIdAndDelete(productId);
  }

  async getProductBySlug(slug: string): Promise<IProduct> {
    const product = await ProductModel.findOne({ slug, isActive: true })
      .populate('vendorId', 'storeName slug logo')
      .populate('categoryId', 'name slug');

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async listProducts(query: QueryProductsInput): Promise<{ products: IProduct[]; meta: PaginationMeta }> {
    const filter: Record<string, unknown> = { isActive: true };

    if (query.category) {
      filter.categoryId = new Types.ObjectId(query.category);
    }

    if (query.vendor) {
      filter.vendorId = new Types.ObjectId(query.vendor);
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) {
        (filter.price as Record<string, number>).$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        (filter.price as Record<string, number>).$lte = query.maxPrice;
      }
    }

    const sortOption: Record<string, 1 | -1> = {};
    switch (query.sort) {
      case 'price_asc':
        sortOption.price = 1;
        break;
      case 'price_desc':
        sortOption.price = -1;
        break;
      case 'rating':
        sortOption.ratingAverage = -1;
        break;
      case 'newest':
      default:
        sortOption.createdAt = -1;
        break;
    }

    const skip = (query.page - 1) * query.limit;

    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .populate('vendorId', 'storeName slug logo')
        .populate('categoryId', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(query.limit),
      ProductModel.countDocuments(filter),
    ]);

    return {
      products,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}

export const productsService = new ProductsService();
