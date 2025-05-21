import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { LoginParentReq, RequestUser } from '../request';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}
  async createUser(
    { name, email, password, parentEmail }: RequestUser,
    file: Express.Multer.File,
  ): Promise<User> {
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
      profileImage: file?.filename || null,
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
  
  async updateUser(
    { id, updateData }: { id: string; updateData: RequestUser },
    file: Express.Multer.File,
  ): Promise<User | null> {
    const updateUser = this.userModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
          profileImage: file?.filename || null,
        },
      },
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

  async findOneUser(id: string): Promise<User | null> {
    const getOneUser = this.userModel.findOne({ _id: id, deletedAt: null });
    return getOneUser;
  }

  async loginUser(email: string, password: string): Promise<User | null> {
    const validateUser = await this.userModel
      .findOne({
        email: email,
        deletedAt: null,
      })
      .select('_id name password profileImage')
      .exec();

    if (!validateUser || !validateUser.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = validateUser?.password;
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid User');
    }
    return validateUser;
  }

  async parentGenerateOtp(parentData: LoginParentReq) {
    const isParentEmail = await this.userModel
      .find({ parentEmail: parentData.parentEmail })
      .exec();

    if (!isParentEmail) {
      throw new UnauthorizedException('Inavlid Parent Email Address');
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
    await this.userModel.updateMany(
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

    return `Otp sent to the your mail id.`;
  }

  async parentProcessOtp(email, otp): Promise<User[]> {
    const parentInfo = await this.userModel
      .findOne({
        parentEmail: email,
        parentOtp: otp,
      })
      .exec();
    let parentSavedOtp = parentInfo?.parentOtp;
    if (parentSavedOtp === otp) {
      const parentData = await this.userModel.find({ parentEmail: email });
      return parentData;
    } else {
      throw new UnauthorizedException('Invalid Email or Wrong OTP');
    }
  }
}
