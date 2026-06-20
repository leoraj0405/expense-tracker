import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginParentReq, RequestUser } from '../request';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  async createUser(
    { name, email, password, parentEmail }: RequestUser,
    file?: Express.Multer.File,
  ): Promise<User> {
    const hashValueLength = 10;
    const hashedPassword = await bcrypt.hash(password, hashValueLength);
    const newUser = this.userRepo.create({
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
    this.logger.log(`The user created`);
    return this.userRepo.save(newUser);
  }

  async updateUser(
    { id, updateData }: { id: string; updateData: RequestUser },
    file: Express.Multer.File,
  ): Promise<User | null> {
    await this.userRepo.update(id, {
      ...updateData,
      updatedAt: new Date(),
      profileImage: file?.filename || null,
    });
    this.logger.log(`The user updated`);
    return this.findOneUser(id);
  }

  async deleteUser(id: string): Promise<User | null> {
    await this.userRepo.update(id, { deletedAt: new Date() });
    this.logger.log(`The user deleted (soft delete)`);
    return this.userRepo.findOne({ where: { id } });
  }

  async findOneUser(id: string): Promise<User | null> {
    const getOneUser = await this.userRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    this.logger.log(`Fetch user by id ${id}`);
    return getOneUser;
  }

  async loginUser(email: string, password: string): Promise<User | null> {
    const validateUser = await this.userRepo.findOne({
      where: { email, deletedAt: IsNull() },
      select: ['id', 'name', 'email', 'password', 'profileImage'],
    });
    if (!validateUser || !validateUser.password) {
      throw new UnauthorizedException('Invalid email or user does not exist');
    }
    const isMatch = await bcrypt.compare(password, validateUser.password);
    if (!isMatch) {
      this.logger.log(`The user not logged`);
      throw new UnauthorizedException('Invalid User');
    }
    this.logger.log(`The user logged`);
    return validateUser;
  }

  async parentGenerateOtp(parentData: LoginParentReq) {
    const isParentEmail = await this.userRepo.find({
      where: { parentEmail: parentData.parentEmail },
    });

    if (!isParentEmail.length) {
      this.logger.error(
        `Inavlid Parent Email Address ${parentData.parentEmail}`,
      );
      throw new UnauthorizedException('Inavlid Parent Email Address');
    }
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = '';
    const length = 6;
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters[randomIndex];
    }
    const mailId = parentData.parentEmail;
    await this.userRepo.update({ parentEmail: mailId }, { parentOtp: otp });
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
    this.logger.log(`Otp sent to email : ${parentData.parentEmail}`);
    return `Otp sent to the your mail id.`;
  }

  async parentProcessOtp(email, otp): Promise<User[]> {
    const parentInfo = await this.userRepo.findOne({
      where: { parentEmail: email, parentOtp: otp },
    });
    const parentSavedOtp = parentInfo?.parentOtp;
    if (parentSavedOtp === otp) {
      const parentData = await this.userRepo.find({
        where: { parentEmail: email },
      });
      this.logger.log(`Parent Email and OTP is correct`);
      return parentData;
    }
    this.logger.error(`Invalid Email : ${email} or Wrong OTP : ${otp} `);
    throw new UnauthorizedException('Invalid Email or Wrong OTP');
  }

  async checkUserByEmail(email: string): Promise<User[] | null> {
    return this.userRepo.find({ where: { email, deletedAt: IsNull() } });
  }

  async generateOTP(email: string) {
    const isEmail = await this.userRepo.findOne({
      where: { email, deletedAt: IsNull() },
    });
    if (!isEmail) {
      this.logger.error(`Inavlid Email Address ${email}`);
      return null;
    }
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = '';
    const length = 6;
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters[randomIndex];
    }
    await this.userRepo.update({ email }, { otp });
    await this.mailerService.sendMail({
      to: email,
      subject: 'RESET PASSWORD VERIFICATION',
      text: `Hi [ User ],
              Your One-Time Password (OTP) for rest your password
              🔐 ${otp} 
              Please do not share this code with anyone.
              Thanks you,
              Expense Tracker Team`,
    });
    this.logger.log(`Otp sent to email : ${email}`);
    return `Otp sent to the your mail id.`;
  }

  async processOTP(email: string, otp: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { email, otp },
    });
    const userSavedOtp = user?.otp;
    if (userSavedOtp !== otp) {
      this.logger.error(`Invalid Email : ${email} or Wrong OTP : ${otp} `);
      return null;
    }
    const hashValueLength = 10;
    const hashedPassword = await bcrypt.hash(password, hashValueLength);
    await this.userRepo.update({ email }, { otp, password: hashedPassword });
    this.logger.log(`User password reseted`);
    return this.userRepo.findOne({ where: { email } });
  }
}
