import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestGrpExpense } from '../request';
import { GroupExpense } from 'src/schemas/groupExpense.schema';

@Injectable()
export class GrpExpenseService {
  constructor(
    @InjectModel(GroupExpense.name) private grpExpenseModel: Model<GroupExpense>,
  ) {}

  async createGrpExpense({
    groupId,
    description,
    amount,
    userId,
    categoryId
  }: RequestGrpExpense) {
    try {
      const postGrpExpense = new this.grpExpenseModel({
        groupId,
        description,
        amount,
        userId,
        categoryId,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      }).save();
      return postGrpExpense;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async findAllGrpExpense(): Promise<GroupExpense[]> {
    try {
      const getGrpExpense = await this.grpExpenseModel
        .find({
          deletedAt: null,
        })

        .populate({ path: 'groupId', select: '-_id name' })
        .populate({path: 'userId', select: '-_id name'})
        .populate({path: 'categoryId', select: '-_id name'})
        .exec();
      return getGrpExpense;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async putGrpExpense(
    id: string,
    updateData: RequestGrpExpense,
  ): Promise<GroupExpense | null> {
    try {
      const updateGrpExpense = await this.grpExpenseModel
        .findByIdAndUpdate(
          id,
          { $set: { ...updateData, updatedAt: new Date() } },
          { new: true },
        )
        .exec();
      return updateGrpExpense;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async deleteGrpExpense(id: string): Promise<GroupExpense | null> {
    try {
      const delGrpExpense = await this.grpExpenseModel
        .findByIdAndUpdate(
          id,
          { $set: { deletedAt: new Date() } },
          { new: true },
        )
        .exec();
      return delGrpExpense;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async singleGrpExpense(id: string): Promise<GroupExpense | null> {
    try {
      const oneGrpExpense = await this.grpExpenseModel
        .findOne({ _id: id, deletedAt: null })
        .populate({ path: 'groupId', select: '-_id name' })
        .populate({path: 'userId', select: '-_id name'})
        .populate({path: 'categoryId', select: '-_id name'})
        .exec();
      return oneGrpExpense;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}
