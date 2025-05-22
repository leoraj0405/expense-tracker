import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestGrpExpense } from '../request';
import { GroupExpense } from 'src/schemas/groupExpense.schema';

@Injectable()
export class GrpExpenseService {
  private readonly logger = new Logger(GroupExpense.name);
  constructor(
    @InjectModel(GroupExpense.name)
    private groupExpensemodel: Model<GroupExpense>,
  ) {}

  async createGroupExpense({
    groupId,
    description,
    amount,
    userId,
    categoryId,
  }: RequestGrpExpense) 
  {

    const postGrpExpense = new this.groupExpensemodel({
      groupId,
      description,
      amount,
      userId,
      categoryId,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    }).save();
    this.logger.log(`The Group expense created`);
    return postGrpExpense;
  }

  async updateGroupExpenseById(
    id: string,
    updateData: RequestGrpExpense,
  ): Promise<GroupExpense | null> {
    const updateGroupExpense = await this.groupExpensemodel
      .findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true },
      )
      .exec();
    this.logger.log(
      `The Group expense updated by Id : ${id} the values : ${updateData}`,
    );

    return updateGroupExpense;
  }

  async deleteGroupExpenseById(id: string): Promise<GroupExpense | null> {
    const deletegroupExpense = await this.groupExpensemodel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
      .exec();
    this.logger.log(`The Group expense ${id} deleted (soft delete)`);
    return deletegroupExpense;
  }

  async getGroupExpenseById(id: string): Promise<GroupExpense[] | null> {
    const oneGrpExpense = await this.groupExpensemodel.aggregate([
      { $match: { _id: new Types.ObjectId(id), deletedAt: null } },
      {
        $lookup: {
          from: 'groups',
          localField: 'groupId',
          foreignField: '_id',
          as: 'group',
        },
      },
      { $unwind: '$group' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          description: 1,
          amount: 1,
          'group.name': 1,
          'category.name': 1,
          'user.name': 1,
          'group._id': 1,
          'category._id': 1,
          'user._id': 1,
        },
      },
    ]);
    this.logger.log(`The group expense fetch by Id : ${id}`);

    return oneGrpExpense;
  }

  async getGroupExpensesByGroupId(id: string): Promise<GroupExpense[]> {
    const groupId = new Types.ObjectId(id)
    const groupExpenses = await this.groupExpensemodel.aggregate([
      { $match: { groupId: groupId, deletedAt: null } },
      {
        $lookup: {
          from: 'groups',
          localField: 'groupId',
          foreignField: '_id',
          as: 'group',
        },
      },
      { $unwind: '$group' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          description: 1,
          amount: 1,
          'group.name': 1,
          'category.name': 1,
          'user.name': 1,
          'user._id': 1
        },
      },
    ]);
    this.logger.log(`The group expense fetch by group Id : ${id}`);
    return groupExpenses;
  }
}
