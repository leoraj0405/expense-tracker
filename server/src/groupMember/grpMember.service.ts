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

  async createGrpMember({
    groupId,
    userId,
  }: RequestGrpMember) {
    try {
      const postGrpMember = new this.grpMemberModel({
        groupId,
        userId,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      }).save();
      return postGrpMember;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async findAllGrpMember(): Promise<GroupMember[]> {
    try {
      const getGrpMember = await this.grpMemberModel
        .find({
          deletedAt: null,
        })

        .populate({ path: 'groupId', select: '-_id name' })
        .populate({path: 'userId', select: '-_id name'})
        .exec();
      return getGrpMember;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async putGrpMember(
    id: string,
    updateData: RequestGrpMember,
  ): Promise<GroupMember | null> {
    try {
      const updateGrpMember = await this.grpMemberModel
        .findByIdAndUpdate(
          id,
          { $set: { ...updateData, updatedAt: new Date() } },
          { new: true },
        )
        .exec();
      return updateGrpMember;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async deleteGrpMember(id: string): Promise<GroupMember | null> {
    try {
      const delGrpMember = await this.grpMemberModel
        .findByIdAndUpdate(
          id,
          { $set: { deletedAt: new Date() } },
          { new: true },
        )
        .exec();
      return delGrpMember;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async singleGrpMember(id: string): Promise<GroupMember | null> {
    try {
      const oneGrpMember = await this.grpMemberModel
        .findOne({ _id: id, deletedAt: null })
        .populate({ path: 'groupId', select: '-_id name' })
        .populate({path: 'userId', select: '-_id name'})
        .exec();
      return oneGrpMember;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}
