import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestGrpMember } from '../request';
import { GroupMember } from 'src/schemas/groupMember.schema';
import { GroupByOptionsWithElement } from 'rxjs';
@Injectable()
export class GrpMemberService {
  constructor(
    @InjectModel(GroupMember.name) private grpMemberModel: Model<GroupMember>,
  ) {}

  async createGrpMember({ groupId, userId }: RequestGrpMember) {
    const postGrpMember = new this.grpMemberModel({
      groupId,
      userId,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    }).save();
    return postGrpMember;
  }

  async findAllGrpMember(): Promise<GroupMember[]> {
    const getGrpMember = await this.grpMemberModel
      .find({
        deletedAt: null,
      })

      .populate({ path: 'groupId', select: '_id name' })
      .populate({ path: 'userId', select: '_id name' })
      .exec();
    return getGrpMember;
  }

  async putGrpMember(
    id: string,
    updateData: RequestGrpMember,
  ): Promise<GroupMember | null> {
    const updateGrpMember = await this.grpMemberModel
      .findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true },
      )
      .exec();
    return updateGrpMember;
  }

  async deleteGrpMember(id: string): Promise<GroupMember | null> {
    const delGrpMember = await this.grpMemberModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
      .exec();
    return delGrpMember;
  }

  async singleGrpMember(id: string): Promise<GroupMember | null> {
    const oneGrpMember = await this.grpMemberModel
      .findOne({ _id: id, deletedAt: null })
      .populate({ path: 'groupId', select: '_id name' })
      .populate({ path: 'userId', select: '_id name' })
      .exec();
    return oneGrpMember;
  }
}
