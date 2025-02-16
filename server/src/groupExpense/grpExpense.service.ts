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

//   async findAllGroup(): Promise<Group[]> {
//     try {
//       const getGroup = await this.groupModel
//         .find({
//           deletedAt: null,
//         })
//         .populate({ path: 'createdBy', select: '-_id name' })
//         .exec();
//       return getGroup;
//     } catch (error) {
//       throw new InternalServerErrorException(`Error : ${error.message}`);
//     }
//   }

//   async putGroup(
//     id: string,
//     updateData: RequestGroup,
//   ): Promise<Group | null> {
//     try {
//       const updateGroup = await this.groupModel
//         .findByIdAndUpdate(
//           id,
//           { $set: { ...updateData, updatedAt: new Date() } },
//           { new: true },
//         )
//         .exec();
//       return updateGroup;
//     } catch (error) {
//       throw new InternalServerErrorException(`Error: ${error.message}`);
//     }
//   }

//   async deleteGroup(id: string): Promise<Group | null> {
//     try {
//       const delGroup = await this.groupModel
//         .findByIdAndUpdate(
//           id,
//           { $set: { deletedAt: new Date() } },
//           { new: true },
//         )
//         .exec();
//       return delGroup;
//     } catch (error) {
//       throw new InternalServerErrorException(`Error: ${error.message}`);
//     }
//   }

//   async singleGroup(id: string): Promise<Group | null> {
//     try {
//       const oneGroup = await this.groupModel
//         .findOne({ _id: id, deletedAt: null })
//         .exec();
//       return oneGroup;
//     } catch (error) {
//       throw new InternalServerErrorException(`Error: ${error.message}`);
//     }
//   }
}
