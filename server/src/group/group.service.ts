import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestGroup } from '../request';
import { Group } from 'src/schemas/group.schma';
@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
  ) {}

  async createGroup({
    name,
    createdBy
  }: RequestGroup) {
    try {
      const postExpense = new this.groupModel({
        name,
        createdBy,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      }).save();
      return postExpense;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async findAllGroup(): Promise<Group[]> {
    try {
      const getGroup = await this.groupModel
        .find({
          deletedAt: null,
        })
        .populate({ path: 'createdBy', select: '-_id name' })
        .exec();
      return getGroup;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async putGroup(
    id: string,
    updateData: RequestGroup,
  ): Promise<Group | null> {
    try {
      const updateGroup = await this.groupModel
        .findByIdAndUpdate(
          id,
          { $set: { ...updateData, updatedAt: new Date() } },
          { new: true },
        )
        .exec();
      return updateGroup;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async deleteGroup(id: string): Promise<Group | null> {
    try {
      const delGroup = await this.groupModel
        .findByIdAndUpdate(
          id,
          { $set: { deletedAt: new Date() } },
          { new: true },
        )
        .exec();
      return delGroup;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async singleGroup(id: string): Promise<Group | null> {
    try {
      const oneGroup = await this.groupModel
        .findOne({ _id: id, deletedAt: null })
        .populate({ path: 'createdBy', select: '-_id name' })
        .exec();
      return oneGroup;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}
