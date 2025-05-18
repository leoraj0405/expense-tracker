import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schemas/category.schema';
import { RequestCategory } from '../request';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async createCategory({ name }: RequestCategory) {
    const postCategory = new this.categoryModel({
      name,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    }).save();
    return postCategory;
  }

  async findAllCategory(page: number, limit: number): Promise<Category[] | {}> {
    let category;
    let totalCount;
    let filter;

    const limitNo = limit ?? 5;
    const pageNo = page ?? 1;
    const skip = (pageNo - 1) * limitNo;
    filter = { deletedAt: null };
    category = await this.categoryModel
      .find({ deletedAt: null })
      .skip(skip)
      .limit(limitNo)
      .exec();

    totalCount = await this.categoryModel.countDocuments(filter);

    return {
      limit: limitNo,
      page: pageNo,
      total: totalCount,
      categoryData: category,
    };
  }

  async putCategory(
    id: string,
    updateData: RequestCategory,
  ): Promise<Category | null> {
    const updateCategory = await this.categoryModel
      .findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true },
      )
      .exec();
    return updateCategory;
  }

  async deleteCategory(id: string): Promise<Category | null> {
    const delCategory = await this.categoryModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
      .exec();
    return delCategory;
  }

  async singleCategory(id: string): Promise<Category | null> {
    const singleCategory = await this.categoryModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    return singleCategory;
  }
}
