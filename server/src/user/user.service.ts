import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { RequestUser } from '../request';
import { LoginUserReq } from '../request';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async createUser({ name, email, password }: RequestUser): Promise<User> {
    try {
      const newUser = new this.userModel({
        name,
        email,
        password,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      });
      return newUser.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async findAllUser(): Promise<User[]> {
    try {
      const getUser = this.userModel.find({
        deletedAt: null,
      });
      return getUser.exec();
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async updateUser(id: string, updateData: RequestUser): Promise<User | null> {
    try {
      const updateUser = this.userModel.findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true },
      );
      return updateUser.exec();
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async deleteUser(id: string): Promise<User | null> {
    try {
      const deleteuser = this.userModel.findByIdAndUpdate(
        id,
        { $set: { deletedAt: new Date() } },
        { new: true },
      );
      return deleteuser.exec();
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async findOneUser(id: string): Promise<User | null> {
    try {
      const getOneUser = this.userModel.findOne({ _id: id, deletedAt: null });
      return getOneUser;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async loginUser(updateData: LoginUserReq) {
    try {
      const loginUser = await this.userModel.findOne({
        email: updateData.email,
        password: updateData.password,
        deletedAt: null,
      });
      return loginUser
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }
}
