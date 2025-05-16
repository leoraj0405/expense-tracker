import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestExpense } from '../request';
import { Expense } from 'src/schemas/expense.schma';
import { from } from 'rxjs';

@Injectable()
export class ExpenseService {
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
    try {
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
      return postExpense;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async findAllExpense(): Promise<Expense[]> {
    try {
      const getExpense = await this.expenseModel
        .find({
          deletedAt: null,
        })
        .populate({ path: 'userId', select: '-_id name' })
        .populate({ path: 'categoryId', select: '-_id name' })
        .exec();
      return getExpense;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async putExpense(
    id: string,
    updateData: RequestExpense,
  ): Promise<Expense | null> {
    try {
      const updateExpense = await this.expenseModel
        .findByIdAndUpdate(
          id,
          { $set: { ...updateData, updatedAt: new Date() } },
          { new: true },
        )
        .exec();
      return updateExpense;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async deleteExpense(id: string): Promise<Expense | null> {
    try {
      const delExpense = await this.expenseModel
        .findByIdAndUpdate(
          id,
          { $set: { deletedAt: new Date() } },
          { new: true },
        )
        .exec();
      return delExpense;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async singleExpense(id: string): Promise<Expense | null> {
    try {
      const oneExpense = await this.expenseModel
        .findOne({ _id: id, deletedAt: null })
        .populate({ path: 'userId', select: '_id name' })
        .populate({ path: 'categoryId', select: '_id name' })
        .exec();
      return oneExpense;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async userExpenses(
    id: string,
    date: string,
    limit: number,
    page: number,
  ): Promise<Expense | {}> {

    let userExpenses;
    let totalCount;
    let filter;

    const limitNo = limit ?? 10;
    const pageNo = page ?? 1;
    const skip = (pageNo - 1) * limitNo;

    if (date) {
      const inputDate = new Date(date);
      const year = inputDate.getFullYear();
      const month = inputDate.getMonth() + 1;

      const fromDate = new Date(year, month - 1, 1);
      const toDate = new Date(year, month, 1);

      filter = {
        userId: id,
        deletedAt: null,
        date: { $gte: fromDate, $lt: toDate },
      };

      userExpenses = await this.expenseModel
        .find({
          userId: id,
          deletedAt: null,
          date: { $gte: fromDate, $lt: toDate },
        })
        .skip(skip)
        .limit(limitNo)
        .populate({ path: 'userId', select: '_id name' })
        .populate({ path: 'categoryId', select: '_id name' })
        .exec();

      totalCount = await this.expenseModel.countDocuments(filter);
    } else {
      filter = {
        userId: id,
        deletedAt: null,
      };
      userExpenses = await this.expenseModel
        .find({
          userId: id,
          deletedAt: null,
        })
        .populate({ path: 'userId', select: '_id name' })
        .populate({ path: 'categoryId', select: '_id name' })
        .exec();

      totalCount = await this.expenseModel.countDocuments(filter);
    }
    return {
      limit: limitNo,
      page: pageNo,
      total: totalCount,
      userExpenseData: userExpenses,
    };
  }
}
