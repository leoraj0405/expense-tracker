import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Expense } from '../entities/expense.entity';
import { RequestCategory } from '../request';
import { GroupExpense } from '../entities/group-expense.entity';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    @InjectRepository(GroupExpense)
    private groupExpenseRepo: Repository<GroupExpense>,
  ) {}

  async createCategory({ name }: RequestCategory) {
    const postCategory = this.categoryRepo.save(
      this.categoryRepo.create({
        name,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      }),
    );
    this.logger.log(`Create Category ${name}.`);
    return postCategory;
  }

  async findAllCategory(page: number, limit: number): Promise<Category | {}> {
    const limitNo = limit ?? 5;
    const pageNo = page ?? 1;
    const skip = (pageNo - 1) * limitNo;
    const [category, totalCount] = await this.categoryRepo.findAndCount({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
      skip,
      take: limitNo,
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
    await this.categoryRepo.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });
    this.logger.log(`Categories updated for ${updateData}.`);
    return this.categoryRepo.findOne({ where: { id } });
  }

  async deleteCategory(id: string): Promise<Category | null> {
    const isUsedInExp = await this.expenseRepo.exists({
      where: { categoryId: id, deletedAt: IsNull() },
    });
    const isUsedInGrpExp = await this.groupExpenseRepo.exists({
      where: { categoryId: id, deletedAt: IsNull() },
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
    await this.categoryRepo.update(id, { deletedAt: new Date() });
    this.logger.log(`This ${id} category deleted (soft delete).`);
    return this.categoryRepo.findOne({ where: { id } });
  }

  async findCategoryById(id: string): Promise<Category | null> {
    const singleCategory = await this.categoryRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    this.logger.log(`This ${id} category fetched.`);
    return singleCategory;
  }
}
