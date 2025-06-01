import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestGrpMember } from '../request';
import { GroupMember } from 'src/schemas/groupMember.schema';
import { GroupExpense } from 'src/schemas/groupExpense.schema';
import { MailerService } from '@nestjs-modules/mailer';

export interface GroupMemberWithUser {
  _id: Types.ObjectId;
  group: { name: string };
  user: { _id: string; name: string };
}

@Injectable()
export class GrpMemberService {
  
  private readonly logger = new Logger(GroupMember.name);
  constructor(
    @InjectModel(GroupMember.name) private grpMemberModel: Model<GroupMember>,
    @InjectModel(GroupExpense.name)
    private grpExpenseModel: Model<GroupExpense>,
    private readonly mailerService: MailerService,
    
  )
   {}

  
  async createGroupMember( groupId, userId ) {
    const createMember = new this.grpMemberModel({
      groupId,
      userId,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    }).save();
    this.logger.log(`Group member created ${userId}`);
    return createMember;
  }

  async updateGroupMember(
    id: string,
    updateData: RequestGrpMember,
  ): Promise<GroupMember | null> {
    const updateMember = await this.grpMemberModel
      .findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true },
      )
      .exec();
    this.logger.log(`The group member updated by Id : ${id}`);
    return updateMember;
  }

  async deleteGrpMember(id: string): Promise<GroupMember | null> {
    const isUsed = await this.grpExpenseModel.exists({
      userId: id,
      deletedAt: null,
    });
    if (isUsed) {
      this.logger.error(
        `The member is used in group expense and cannot delete : ${id}`,
      );
      throw new BadRequestException(
        'The member is used in Group expense and cannot delete',
      );
    }
    const delGrpMember = await this.grpMemberModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
      .exec();
    this.logger.error(`The member deleted (soft delete) : ${id}`);
    return delGrpMember;
  }

  async fetchGroupMemberById(id: string): Promise<GroupMember[] | null> {
    const oneGrpMember = await this.grpMemberModel.aggregate([
      { $match: { _id: new Types.ObjectId(id), deletedAt: null } },
      {
        $lookup: {
          from: 'groups',
          localField: 'groupId',
          foreignField: '_id',
          as: 'group',
        },
      },
      {$unwind: '$group'},
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {$unwind: '$user'},
      {
        $project: {
          _id: 1,
          'group.name': 1,
          'group._id': 1,
          'user.name': 1,
          'user.email' : 1
        },
      },
    ]);
    this.logger.log(`The ${id} group member fetched`);
    return oneGrpMember;
  }

  async fetchGroupMembersByGroupId(id: string): Promise<GroupMemberWithUser[] | null> {
    const groupId = new Types.ObjectId(id)
    const groupMembers = await this.grpMemberModel.aggregate([
      { $match: { groupId: groupId, deletedAt: null } },
      {
        $lookup: {
          from: 'groups',
          localField: 'groupId',
          foreignField: '_id',
          as: 'group',
        },
      },
      {$unwind: '$group'},
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {$unwind: '$user'},
      {
        $project: {
          _id: 1,
          description: 1,
          amount: 1,
          'group.name': 1,
          'user.name': 1,
          'user._id' : 1,
          'user.email': 1
        },
      },
    ]);
    this.logger.log(`The group members fetched by group id : ${id}`);
    return groupMembers;
  }

  async sendLoginCredentialsInfoToUserEmail(email: string): Promise<any> {
      await this.mailerService.sendMail({
      to: email,
      subject: 'LOGIN AUTHENTICATION',
      text: `Hi [ New User ],
              You are recently register in the expense tracker web application 
              your login credentials 
              [ user name or email : ${email} password : 12345678 ]
               after you login kindly change ur other informations.
              Expense Tracker Team`,
    });
    this.logger.log(`Otp sent to email : ${email}`)
    return `Otp sent to the your mail id.`;
  }
}
