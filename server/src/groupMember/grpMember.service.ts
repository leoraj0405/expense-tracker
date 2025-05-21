import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestGrpMember } from '../request';
import { GroupMember } from 'src/schemas/groupMember.schema';
import { GroupExpense } from 'src/schemas/groupExpense.schema';

@Injectable()
export class GrpMemberService {
  private readonly logger = new Logger(GroupMember.name);
  constructor(
    @InjectModel(GroupMember.name) private grpMemberModel: Model<GroupMember>,
    @InjectModel(GroupExpense.name)
    private grpExpenseModel: Model<GroupExpense>,
  ) {}

  async createGroupMember({ groupId, userId }: RequestGrpMember) {
    const createMember = new this.grpMemberModel({
      groupId,
      userId,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    }).save();
    this.logger.log(`Group member created ${userId}`);
    return createMember;
  }

  async updateGroupMember(
    id: string,
    updateData: RequestGrpMember,
  ): Promise<GroupMember | null> {
    const updateMember = await this.grpMemberModel
      .findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true },
      )
      .exec();
    this.logger.log(`The group member updated by Id : ${id}`);
    return updateMember;
  }

  async deleteGrpMember(id: string): Promise<GroupMember | null> {
    const isUsed = await this.grpExpenseModel.exists({
      userId: id,
      deletedAt: null,
    });
    if (isUsed) {
      this.logger.error(
        `The member is used in group expense and cannot delete : ${id}`,
      );
      throw new BadRequestException(
        'The member is used in Group expense and cannot delete',
      );
    }
    const delGrpMember = await this.grpMemberModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
      .exec();
    this.logger.error(`The member deleted (soft delete) : ${id}`);
    return delGrpMember;
  }

  async fetchGroupMemberById(id: string): Promise<GroupMember[] | null> {
    const oneGrpMember = await this.grpMemberModel.aggregate([
      { $match: { _id: id, deletedAt: null } },
      {
        $lookup: {
          from: 'groups',
          localField: 'groupId',
          foreignField: '_id',
          as: 'group',
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
      {
        $project: {
          _id: 1,
          description: 1,
          amount: 1,
          '$group.name': 1,
          '$user.name': 1,
        },
      },
    ]);
    this.logger.error(`The member deleted (soft delete) : ${id}`);
    return oneGrpMember;
  }

  async fetchGroupMembersByGroupId(id: string): Promise<GroupMember[] | null> {
    const groupMembers = await this.grpMemberModel.aggregate([
      { $match: { groupId: id, deletedAt: null } },
      {
        $lookup: {
          from: 'groups',
          localField: 'groupId',
          foreignField: '_id',
          as: 'group',
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
      {
        $project: {
          _id: 1,
          description: 1,
          amount: 1,
          '$group.name': 1,
          '$user.name': 1,
        },
      },
    ]);
    this.logger.error(`The group members fetched by group id : ${id}`);
    return groupMembers;
  }
}
