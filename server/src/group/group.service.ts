import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestGroup } from '../request';
import { Group } from 'src/schemas/group.schma';
import { GroupMember } from 'src/schemas/groupMember.schema';
import { Types } from 'mongoose';
@Injectable()
export class GroupService {
  private readonly logger = new Logger(Group.name);
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(GroupMember.name) private grpMemberModel: Model<GroupMember>,
  ) {}

  async createGroup({ name, createdBy }: RequestGroup) {
    const postExpense = new this.groupModel({
      name,
      createdBy,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    }).save();
    this.logger.log(`The ${name} group was created by ${createdBy}`);
    return postExpense;
  }

  async updateGroupById(
    id: string,
    updateData: RequestGroup,
  ): Promise<Group | null> {
    const updateGroup = await this.groupModel
      .findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true },
      )
      .exec();
    this.logger.log(`The ${id} Group was updated update data : ${updateData}`);
    return updateGroup;
  }

  async deleteGroup(id: string): Promise<Group | null> {
    const delGroup = await this.groupModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
      .exec();
    this.logger.warn(`The ${id} Group was delete(soft delete)`);
    return delGroup;
  }

  async fetchGroupById(id: string): Promise<Group[] | null> {
    const oneGroup = await this.groupModel.aggregate([
      { $match: { _id: id, deletedAt: null } },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          _id: 1,
          'user.name': 1,
          name: 1,
        },
      },
    ]);
    this.logger.log(`The expense fetch by Id : ${id}`);
    return oneGroup;
  }

  async fetchGroupByUserId(id: string): Promise<Group[] | null> {
    const memberships = await this.grpMemberModel
      .find({ userId: { $eq: id }, deletedAt: null })
      .exec();

    const groupIds = memberships.map((member) => member.groupId);
    const groups = await this.groupModel.aggregate([
      {
        $match: {
          _id: { $in: groupIds.map((id) => id) },
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
        },
      },
      { $unwind: '$createdBy' },
      {
        $project: {
          _id: 1,
          name: 1,
          '$createdBy.name' : 1,
        },
      },
    ]);
    this.logger.log(`The group fetch by user Id : ${id}`)
    return groups;
  }
}
