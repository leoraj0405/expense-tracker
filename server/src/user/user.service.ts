import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';
import { GroupMember } from '../entities/group-member.entity';
import { LoginParentReq, RequestUser } from '../request';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { buildOtpEmail } from '../utils/email-templates';
import { BlobStorageService } from '../storage/blob-storage.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
    private readonly mailerService: MailerService,
    private readonly blobStorage: BlobStorageService,
  ) {}

  async createUser(
    { name, email, password, parentEmail }: RequestUser,
    file?: Express.Multer.File,
  ): Promise<User> {
    const hashValueLength = 10;
    const hashedPassword = await bcrypt.hash(password, hashValueLength);
    let profileImage: string | null = null;
    if (file) {
      profileImage = await this.blobStorage.uploadProfileImage(file);
    }
    const newUser = this.userRepo.create({
      name,
      email,
      password: hashedPassword,
      parentEmail,
      parentOtp: null,
      otp: null,
      otpAttempt: null,
      blockTime: null,
      profileImage,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    });
    this.logger.log(`The user created`);
    return this.userRepo.save(newUser);
  }

  async updateUser(
    { id, updateData }: { id: string; updateData: RequestUser },
    file?: Express.Multer.File,
  ): Promise<User | null> {
    const existing = await this.findOneUser(id);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updates: Partial<User> = {
      ...updateData,
      updatedAt: new Date(),
    };

    if (file) {
      await this.blobStorage.deleteProfileImage(existing.profileImage);
      updates.profileImage = await this.blobStorage.uploadProfileImage(file);
    }

    await this.userRepo.update(id, updates);
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
    const emailContent = buildOtpEmail({
      subject: 'Parent login verification — Expense Tracker',
      preheader: `Your parent portal code is ${otp}`,
      title: 'Verify parent login',
      greeting: 'Hi Parent,',
      intro:
        "Use the verification code below to sign in to the parent portal and review your children's spending.",
      otp,
      expiryNote:
        'This code is for parent portal access only. If you did not request it, please ignore this email.',
    });
    await this.mailerService.sendMail({
      to: mailId,
      subject: emailContent.subject,
      text: emailContent.plainText,
      html: emailContent.html,
    });
    this.logger.log(`Otp sent to email : ${parentData.parentEmail}`);
    return `Otp sent to the your mail id.`;
  }

  async parentProcessOtp(email: string, otp: string): Promise<User[] | null> {
    const normalizedEmail = email.trim();
    const normalizedOtp = otp.trim();

    const parentInfo = await this.userRepo.findOne({
      where: {
        parentEmail: normalizedEmail,
        parentOtp: normalizedOtp,
        deletedAt: IsNull(),
      },
    });
    const parentSavedOtp = parentInfo?.parentOtp;
    if (parentSavedOtp === normalizedOtp) {
      const parentData = await this.userRepo.find({
        where: { parentEmail: normalizedEmail, deletedAt: IsNull() },
      });
      this.logger.log(`Parent Email and OTP is correct`);
      return parentData;
    }
    this.logger.error(
      `Invalid Email : ${normalizedEmail} or Wrong OTP : ${normalizedOtp} `,
    );
    return null;
  }

  async findChildrenByParentEmail(parentEmail: string): Promise<User[]> {
    return this.userRepo.find({
      where: { parentEmail: parentEmail.trim(), deletedAt: IsNull() },
    });
  }

  async checkUserByEmail(email: string): Promise<User[] | null> {
    return this.userRepo.find({ where: { email, deletedAt: IsNull() } });
  }

  async searchUsers(
    query: string,
    groupId?: string,
    limit = 10,
  ): Promise<User[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const excludeUserIds: string[] = [];
    if (groupId) {
      const members = await this.groupMemberRepo.find({
        where: { groupId, deletedAt: IsNull() },
        select: ['userId'],
      });
      excludeUserIds.push(...members.map((m) => m.userId));
    }

    const qb = this.userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.email'])
      .where('user.deletedAt IS NULL')
      .andWhere(
        '(LOWER(user.email) LIKE LOWER(:q) OR LOWER(user.name) LIKE LOWER(:q))',
        { q: `%${trimmed}%` },
      )
      .orderBy('user.name', 'ASC')
      .take(limit);

    if (excludeUserIds.length) {
      qb.andWhere('user.id NOT IN (:...excludeUserIds)', { excludeUserIds });
    }

    return qb.getMany();
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
    const emailContent = buildOtpEmail({
      subject: 'Reset your password — Expense Tracker',
      preheader: `Your password reset code is ${otp}`,
      title: 'Reset your password',
      greeting: 'Hi there,',
      intro:
        'We received a request to reset your Expense Tracker password. Enter the code below to continue.',
      otp,
    });
    await this.mailerService.sendMail({
      to: email,
      subject: emailContent.subject,
      text: emailContent.plainText,
      html: emailContent.html,
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
