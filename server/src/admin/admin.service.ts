import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequsetAdmin } from '../request';
import { Admin } from 'src/schemas/admin.schema';
@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) {}

  async createAdmin({ name, email, password }: RequsetAdmin) {
    try {
      const postAdmin = new this.adminModel({
        name,
        email,
        password,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      }).save();
      return postAdmin;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async findAllAdmin(): Promise<Admin[]> {
    try {
      const getAdmin = await this.adminModel
        .find({
          deletedAt: null,
        })
        .exec();
      return getAdmin;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async putAdmin(id: string, updateData: RequsetAdmin): Promise<Admin | null> {
    try {
      const updateAdmin = await this.adminModel
        .findByIdAndUpdate(
          id,
          { $set: { ...updateData, updatedAt: new Date() } },
          { new: true },
        )
        .exec();
      return updateAdmin;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async deleteAdmin(id: string): Promise<Admin | null> {
    try {
      const delAdmin = await this.adminModel
        .findByIdAndUpdate(
          id,
          { $set: { deletedAt: new Date() } },
          { new: true },
        )
        .exec();
      return delAdmin;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async singleAdmin(id: string): Promise<Admin | null> {
    try {
      const oneAdmin = await this.adminModel
        .findOne({ _id: id, deletedAt: null })
        .exec();
      return oneAdmin;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}
