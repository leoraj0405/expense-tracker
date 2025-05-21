import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schemas/category.schema';
import { Expense } from 'src/schemas/expense.schma';
import { RequestCategory } from '../request';
import { GroupExpense } from 'src/schemas/groupExpense.schema';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(GroupExpense.name)
    private groupExpenseModel: Model<GroupExpense>,
  ) {}

  async createCategory({ name }: RequestCategory) {
    const postCategory = new this.categoryModel({
      name,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    }).save();
    this.logger.log(`Create Category ${name}.`);
    return postCategory;
  }

  async findAllCategory(page: number, limit: number): Promise<Category | {}> {
    const limitNo = limit ?? 5;
    const pageNo = page ?? 1;
    const skip = (pageNo - 1) * limitNo;
    const category = await this.categoryModel
      .find({ deletedAt: null })
      .skip(skip)
      .limit(limitNo)
      .exec();
    const totalCount = await this.categoryModel.countDocuments({
      deletedAt: null,
    });
    this.logger.log(
      `Categories fetched for page number: ${pageNo}, limit: ${limitNo}.`,
    );
    return {
      limit: limitNo,
      page: pageNo,
      total: totalCount,
      categoryData: category,
    };
  }

  async updateCategoryById(
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
    this.logger.log(`Categories updated for ${updateData}.`);
    return updateCategory;
  }

  async deleteCategory(id: string): Promise<Category | null> {
    const isUsedInExp = await this.expenseModel.exists({
      categoryId: id,
      deletedAt: null,
    });
    const isUsedInGrpExp = await this.groupExpenseModel.exists({
      categoryId: id,
      deletedAt: null,
    });
    if (isUsedInExp) {
      this.logger.warn(
        `This ${id} category used in user expense so can't be delete.`,
      );
      throw new BadRequestException(
        'Category is used in your group expense and cannot be deleted.',
      );
    }

    if (isUsedInGrpExp) {
      this.logger.warn(
        `This ${id} category used in group expense so can't be delete`,
      );
      throw new BadRequestException(
        'Category is used in your group expense and cannot be deleted.',
      );
    }
    const delCategory = await this.categoryModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
      .exec();

      this.logger.log(
        `This ${id} category deleted (soft delete).`,
      );
    return delCategory;
  }

  async findCategoryById(id: string): Promise<Category | null> {
    const singleCategory = await this.categoryModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    this.logger.log(
        `This ${id} category fetched.`,
      );
    return singleCategory;
  }
}
