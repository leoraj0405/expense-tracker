import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestExpense } from '../request';
import { Expense } from 'src/schemas/expense.schma';
import { Types } from 'mongoose';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(Expense.name);
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}
  async createExpense({
    userId,
    description,
    amount,
    date,
    categoryId,
  }: RequestExpense) {
    if (Number(amount) === 0 ) {
      throw new HttpException('', HttpStatus.BAD_REQUEST);
    }

    const postExpense = new this.expenseModel({
      userId,
      description,
      amount,
      date,
      categoryId,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    }).save();
    this.logger.log(
      `The expense created values : ${userId}, ${description}, ${amount}, ${date}, ${categoryId}`,
    );
    return postExpense;
  }

  async updateExpense(
    id: string,
    updateData: RequestExpense,
  ): Promise<Expense | null> {
    const updateExpense = await this.expenseModel
      .findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true },
      )
      .exec();
    this.logger.log(
      `The expense updated by Id : ${id}, values : ${updateData}`,
    );
    return updateExpense;
  }

  async deleteExpense(id: string): Promise<Expense | null> {
    const delExpense = await this.expenseModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
      .exec();
    this.logger.warn(`The expense (${id}) deleted (soft delete).`);
    return delExpense;
  }

  async fetchExpense(id: string): Promise<Expense[] | null> {
    const oneExpense = await this.expenseModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }, // 💡 prevent crash if user not found
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }, // 💡 prevent crash if category not found
      {
        $project: {
          _id: 1,
          'category.name': 1,
          'category._id': 1,
          'user.name': 1,
          'user._id': 1,
          amount: 1,
          description: 1,
          date: 1,
        },
      },
    ]);
    this.logger.log(`User expense Fetched`);
    return oneExpense;
  }

  async fetchUserExpenses(
    id: string,
    date: string,
    limit: number,
    page: number,
  ): Promise<Expense | {}> {
    let filter;
    const limitNo = limit ?? 5;
    const pageNo = page ?? 1;
    const skip = (pageNo - 1) * limitNo;

    if (date) {
      const inputDate = new Date(date);
      const year = inputDate.getFullYear();
      const month = inputDate.getMonth() + 1;

      const fromDate = new Date(year, month - 1, 1);
      const toDate = new Date(year, month, 1);

      filter = {
        date: { $gte: fromDate, $lt: toDate },
      };
    }
    const expenses = await this.expenseModel.aggregate([
      {
        $match: { ...filter, userId: new Types.ObjectId(id), deletedAt: null },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: limitNo },
      {
        $project: {
          amount: 1,
          description: 1,
          date: 1,
          'category.name': 1,
          'category._id': 1,
          'user.name': 1,
          'user._id': 1,
          createdAt: 1,
        },
      },
    ]);
    const totalCount = await this.expenseModel.countDocuments({
      ...filter,
      deletedAt: null,
      userId: new Types.ObjectId(id),
    });
    this.logger.log(`User expense Fetch by user Id`);
    return {
      limit: limitNo,
      page: pageNo,
      total: totalCount,
      userExpenseData: expenses,
    };
  }
}
