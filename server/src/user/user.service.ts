import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { LoginParentReq, RequestUser } from '../request';
import { LoginUserReq } from '../request';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}
  async createUser({
    name,
    email,
    password,
    parentEmail,
  }: RequestUser): Promise<User> {
    try {
      const hashValueLength = 10;
      const hashedPassword = await bcrypt.hash(password, hashValueLength);
      const newUser = new this.userModel({
        name,
        email,
        password: hashedPassword,
        parentEmail,
        parentOtp: null,
        otp: null,
        otpAttempt: null,
        blockTime: null,
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

  async loginUser(UserData: LoginUserReq): Promise<User | null> {
    try {
      const validateUser = await this.userModel
        .findOne({
          email: UserData.email,
          deletedAt: null,
        })
        .select('_id name password')
        .exec();

      if (!validateUser || !validateUser.password) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const hashedPassword = validateUser?.password;
      const isMatch = await bcrypt.compare(UserData.password, hashedPassword);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid User');
      }

      return validateUser;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async parentGenerateOtp(parentData: LoginParentReq) {
    try {
      const isParentEmail = await this.userModel
        .findOne({
          parentEmail: parentData.parentEmail,
        })
        .exec();

      if (!isParentEmail) {
        throw new UnauthorizedException('Inavlid Parent Phone Number');
      }
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let otp = '';
      let length = 6;
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[randomIndex];
      }
      let mailId = parentData.parentEmail;
      await this.userModel.findOneAndUpdate(
        { parentEmail: mailId },
        { $set: { parentOtp: otp } },
      );
      await this.mailerService.sendMail({
        to: mailId,
        subject: 'LOGIN AUTHENTICATION',
        text: `Hi [ Parent ],
              Your One-Time Password (OTP) for logging into the Expense Tracker app is:
              🔐 ${otp} 
              Please do not share this code with anyone.
              Thanks you,
              Expense Tracker Team`,
      });

      return `Otp sent to the your mail id `;
    } catch (error) {
      throw new InternalServerErrorException(`Error : ${error.message}`);
    }
  }

  async parentProcessOtp(email, otp): Promise<User> {
    const parentInfo = await this.userModel
      .findOne({
        parentEmail: email,
        parentOtp: otp,
      })
      .exec();
    let parentSavedOtp = parentInfo?.parentOtp;
    if (parentSavedOtp == otp) {
      return email;
    } else {
      throw new UnauthorizedException('Invalid Email or Wrong OTP');
    }
  }
}
