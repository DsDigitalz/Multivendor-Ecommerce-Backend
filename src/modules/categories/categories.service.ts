import { Types } from 'mongoose';
import { CategoryModel } from './categories.model';
import { ICategory } from './categories.interface';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.validation';
import { ConflictError, NotFoundError } from '../../utils/app-error';

export class CategoriesService {
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  async createCategory(data: CreateCategoryInput): Promise<ICategory> {
    const slug = this.generateSlug(data.name);
    const existing = await CategoryModel.findOne({ slug });
    if (existing) {
      throw new ConflictError('Category with this name or slug already exists');
    }

    const category = await CategoryModel.create({
      name: data.name,
      slug,
      description: data.description,
      parentCategory: data.parentCategory ? new Types.ObjectId(data.parentCategory) : null,
      image: data.image,
      isActive: data.isActive ?? true,
    });

    return category;
  }

  async getAllCategories(includeInactive = false): Promise<ICategory[]> {
    const query = includeInactive ? {} : { isActive: true };
    return CategoryModel.find(query).populate('parentCategory', 'name slug').sort({ name: 1 });
  }

  async getCategoryBySlug(slug: string): Promise<ICategory> {
    const category = await CategoryModel.findOne({ slug, isActive: true }).populate(
      'parentCategory',
      'name slug'
    );
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async updateCategory(categoryId: string, data: UpdateCategoryInput): Promise<ICategory> {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (data.name && data.name !== category.name) {
      const slug = this.generateSlug(data.name);
      const existing = await CategoryModel.findOne({ slug, _id: { $ne: category._id } });
      if (existing) {
        throw new ConflictError('Category name already taken');
      }
      category.name = data.name;
      category.slug = slug;
    }

    if (data.description !== undefined) category.description = data.description;
    if (data.parentCategory !== undefined) {
      category.parentCategory = data.parentCategory ? new Types.ObjectId(data.parentCategory) : null;
    }
    if (data.image !== undefined) category.image = data.image;
    if (data.isActive !== undefined) category.isActive = data.isActive;

    await category.save();
    return category;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    await CategoryModel.findByIdAndDelete(categoryId);
  }
}

export const categoriesService = new CategoriesService();
