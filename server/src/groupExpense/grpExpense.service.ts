import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestGrpExpense } from '../request';
import { GroupExpense } from 'src/schemas/groupExpense.schema';
import { GrpMemberService } from 'src/groupMember/grpMember.service';

@Injectable()
export class GrpExpenseService {
  private readonly logger = new Logger(GroupExpense.name);
  constructor(
    @InjectModel(GroupExpense.name)
    private groupExpensemodel: Model<GroupExpense>,

    private readonly memberService: GrpMemberService,
  ) {}

  async createGroupExpense({
    groupId,
    description,
    amount,
    userId,
    categoryId,
    usersAndShares,
    splitMethod,
  }: RequestGrpExpense) {
    var inputs = {
      groupId,
      description,
      amount,
      userId,
      categoryId,
      splitAmong: null as { memberId: string; share: number }[] | null,
      splitUnequal: null as typeof usersAndShares | null,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };
    if (splitMethod === 'equal') {
      const splitEqualArr: { memberId: string; share: number }[] = [];
      const groupMembersArr =
        await this.memberService.fetchGroupMembersByGroupId(groupId);
      const membersId = groupMembersArr?.map((member) => member.user._id);

      membersId?.forEach((id) => {
        splitEqualArr.push({
          memberId: id,
          share: Math.round(Number(amount) / Number(membersId.length)),
        });
      });

      inputs.splitAmong = splitEqualArr;
    } else {
      let total: number = 0;
      usersAndShares.map((item) => {
        total += Number(item.share);
      });
      if (total !== Number(amount)) {
        return 'Users share amount higher or lower than expense amount';
      }
      inputs.splitUnequal = usersAndShares;
    }
    const postGrpExpense = new this.groupExpensemodel(inputs).save();
    this.logger.log(`The Group expense created`);
    return postGrpExpense;
  }

  async updateGroupExpenseById(
    id: string,
    updateData: RequestGrpExpense,
  ): Promise<GroupExpense | null> {
    var inputs = {
      groupId: updateData.groupId,
      description: updateData.description,
      amount: updateData.amount,
      userId: updateData.userId,
      categoryId: updateData.categoryId,
      splitAmong: null as { memberId: string; share: number }[] | null,
      splitUnequal:
        Array.isArray(updateData.usersAndShares) &&
        updateData.usersAndShares.length > 0
          ? updateData.usersAndShares
          : null,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
      splitMethod: updateData.splitMethod,
    };

    if (updateData.splitMethod === 'equal') {
      inputs.splitUnequal = null;

      const splitEqualArr: { memberId: string; share: number }[] = [];
      const groupMembersArr =
        await this.memberService.fetchGroupMembersByGroupId(updateData.groupId);
      const membersId = groupMembersArr?.map((member) => member.user._id);

      membersId?.forEach((id) => {
        splitEqualArr.push({
          memberId: id,
          share: Math.round(updateData.amount / membersId.length),
        });
      });

      inputs.splitAmong = splitEqualArr;
    } else {
      console.log(inputs);
      let total: number = 0;
      updateData.usersAndShares.map((item) => {
        total += Number(item.share);
      });
      if (total !== Number(updateData.amount)) {
        throw new HttpException(
          'Users share amount higher or lower than expense amount',
          HttpStatus.BAD_REQUEST,
        );
      }
      inputs.splitUnequal = updateData.usersAndShares;
    }

    console.log(inputs, id);

    const updateGroupExpense = await this.groupExpensemodel
      .findByIdAndUpdate(
        id,
        { ...inputs, updatedAt: new Date() },
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
          splitAmong: 1,
          splitUnequal: 1,
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
    const groupId = new Types.ObjectId(id);
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
          splitAmong: 1,
          splitUnequal: 1,
          'group.name': 1,
          'category.name': 1,
          'user.name': 1,
          'user._id': 1,
        },
      },
    ]);
    this.logger.log(`The group expense fetch by group Id : ${id}`);
    return groupExpenses;
  }

  async getExpensesByUserId(userId: string, groupId: string): Promise<GroupExpense[] | null> {
   
    const user = new Types.ObjectId(userId);
    const group = new Types.ObjectId(groupId)
    const groupExpenses = await this.groupExpensemodel.aggregate([
      { $match: { userId: user, groupId : group, deletedAt: null } },
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
          splitAmong: 1,
          splitUnequal: 1,
          'group.name': 1,
          'category.name': 1,
          'user.name': 1,
          'user._id': 1,
        },
      },
    ]);
    this.logger.log(`The group expense fetch by user Id : ${userId} in group ${groupId}`);
    return groupExpenses;
  }
}
