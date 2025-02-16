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
    try {
      const postCategory = new this.categoryModel({
        name,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      }).save();
      return postCategory;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async findAllCategory(): Promise<Category[]> {
    try {
      const getCategory = await this.categoryModel
        .find({
          deletedAt: null,
        })
        .exec();
      return getCategory;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async putCategory(
    id: string,
    updateData: RequestCategory,
  ): Promise<Category | null> {
    try {
      const updateCategory = await this.categoryModel
        .findByIdAndUpdate(
          id,
          { $set: { ...updateData, updatedAt: new Date() } },
          { new: true },
        )
        .exec();
      return updateCategory;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async deleteCategory(id: string): Promise<Category | null> {
    try {
      const delCategory = await this.categoryModel
        .findByIdAndUpdate(
          id,
          { $set: { deletedAt: new Date() } },
          { new: true },
        )
        .exec();
      return delCategory;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async singleCategory(id: string): Promise<Category | null> {
    try {
      const singleCategory = await this.categoryModel
        .findOne({ _id: id, deletedAt: null })
        .exec();
      return singleCategory;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}
