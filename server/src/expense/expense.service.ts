import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, IsNull } from 'typeorm';
import { RequestExpense } from '../request';
import { Expense } from '../entities/expense.entity';
import {
  formatCategoryRef,
  formatUserRef,
  mongoId,
} from '../utils/mongo-compat';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);

  constructor(
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
  ) {}

  async createExpense({
    userId,
    description,
    amount,
    date,
    categoryId,
  }: RequestExpense) {
    if (Number(amount) === 0) {
      throw new HttpException('', HttpStatus.BAD_REQUEST);
    }

    const postExpense = this.expenseRepo.save(
      this.expenseRepo.create({
        userId,
        description,
        amount,
        date: new Date(date),
        categoryId,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      }),
    );
    this.logger.log(
      `The expense created values : ${userId}, ${description}, ${amount}, ${date}, ${categoryId}`,
    );
    return postExpense;
  }

  async updateExpense(
    id: string,
    updateData: RequestExpense,
  ): Promise<Expense | null> {
    await this.expenseRepo.update(id, {
      ...updateData,
      date: updateData.date ? new Date(updateData.date) : undefined,
      updatedAt: new Date(),
    });
    this.logger.log(`The expense updated by Id : ${id}, values : ${updateData}`);
    return this.expenseRepo.findOne({ where: { id } });
  }

  async deleteExpense(id: string): Promise<Expense | null> {
    await this.expenseRepo.update(id, { deletedAt: new Date() });
    this.logger.warn(`The expense (${id}) deleted (soft delete).`);
    return this.expenseRepo.findOne({ where: { id } });
  }

  private formatExpenseRow(expense: Expense) {
    return {
      ...mongoId(expense.id),
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      createdAt: expense.createdAt,
      category: expense.category
        ? formatCategoryRef(expense.category)
        : undefined,
      user: expense.user ? formatUserRef(expense.user) : undefined,
    };
  }

  async fetchExpense(id: string) {
    const expense = await this.expenseRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user', 'category'],
    });
    this.logger.log(`User expense Fetched`);
    return expense ? [this.formatExpenseRow(expense)] : [];
  }

  async fetchUserExpenses(
    id: string,
    date: string,
    limit: number,
    page: number,
  ): Promise<Expense | {}> {
    const limitNo = limit ?? 5;
    const pageNo = page ?? 1;
    const skip = (pageNo - 1) * limitNo;

    const where: Record<string, unknown> = {
      userId: id,
      deletedAt: IsNull(),
    };

    if (date) {
      const inputDate = new Date(date);
      const year = inputDate.getFullYear();
      const month = inputDate.getMonth() + 1;
      const fromDate = new Date(year, month - 1, 1);
      const toDate = new Date(year, month, 1);
      where.date = Between(fromDate, toDate);
    }

    const [expenses, totalCount] = await this.expenseRepo.findAndCount({
      where,
      relations: ['user', 'category'],
      order: { date: 'DESC' },
      skip,
      take: limitNo,
    });

    this.logger.log(`User expense Fetch by user Id`);
    return {
      limit: limitNo,
      page: pageNo,
      total: totalCount,
      userExpenseData: expenses.map((e) => this.formatExpenseRow(e)),
    };
  }
}
