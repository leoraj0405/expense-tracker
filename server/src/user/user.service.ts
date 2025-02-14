import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { RequestUser } from './user';

// interface RequestCreateUser2 {
//   name: User["name"],
//   email: User["email"],
//   password: User["password"]
// }

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async createUser({ name, email, password }: RequestUser): Promise<User> {
    const newUser = new this.userModel({
      name,
      email,
      password,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    });
    return newUser.save();
  }

  async findAllUser(): Promise<User[]> {
    const getUser = this.userModel.find({
      deletedAt: null,
    });
    return getUser.exec();
  }

  async updateUser(id: string, updateData: RequestUser): Promise<User | null> {
    const updateUser = this.userModel.findByIdAndUpdate(
      id,
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true },
    );
    return updateUser.exec();
  }

  async deleteUser(id: string): Promise<User | null> {
    const deleteuser = this.userModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    return deleteuser.exec();
  }

  async findOneUser(id: string): Promise<User| null> {
    const getOneUser = this.userModel.findById(id)
    return getOneUser
  }
}
