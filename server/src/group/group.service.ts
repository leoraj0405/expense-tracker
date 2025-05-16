import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestGroup } from '../request';
import { Group } from 'src/schemas/group.schma';
import { GroupMember } from 'src/schemas/groupMember.schema';
@Injectable()
export class GroupService {
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
    return postExpense;
  }

  async findAllGroup(): Promise<Group[]> {
    const getGroup = await this.groupModel
      .find({
        deletedAt: null,
      })
      .populate({ path: 'createdBy', select: '_id name' })
      .exec();
    return getGroup;
  }

  async putGroup(id: string, updateData: RequestGroup): Promise<Group | null> {
    const updateGroup = await this.groupModel
      .findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true },
      )
      .exec();
    return updateGroup;
  }

  async deleteGroup(id: string): Promise<Group | null> {
    const delGroup = await this.groupModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
      .exec();
    return delGroup;
  }

  async singleGroup(id: string): Promise<Group | null> {
    const oneGroup = await this.groupModel
      .findOne({ _id: id, deletedAt: null })
      .populate({ path: 'createdBy', select: '-_id name' })
      .exec();
    return oneGroup;
  }

  async userGroups(id: string): Promise<Group[] | null> {
    const memberships = await this.grpMemberModel
      .find({ userId: { $eq: id }, deletedAt: null })
      .exec();
    const groupIds = memberships.map((member) => member.groupId);
    const groups = await this.groupModel
      .find({ _id: { $in: groupIds }, deletedAt: null })
      .populate({ path: 'createdBy', select: '_id name' })
      .exec();
    return groups;
  }
}
