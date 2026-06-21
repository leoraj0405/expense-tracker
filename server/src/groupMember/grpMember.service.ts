import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { RequestGrpMember } from '../request';
import { GroupMember } from '../entities/group-member.entity';
import { GroupExpense } from '../entities/group-expense.entity';
import { GroupExpenseSplit } from '../entities/group-expense-split.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { buildWelcomeCredentialsEmail } from '../utils/email-templates';
import { formatGroupRef, formatUserRef, mongoId } from '../utils/mongo-compat';

export interface GroupMemberWithUser {
  _id: string;
  group: { name: string };
  user: { _id: string; name: string | null; email?: string };
}

@Injectable()
export class GrpMemberService {
  private readonly logger = new Logger(GrpMemberService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(GroupMember)
    private grpMemberRepo: Repository<GroupMember>,
    @InjectRepository(GroupExpense)
    private grpExpenseRepo: Repository<GroupExpense>,
    @InjectRepository(GroupExpenseSplit)
    private splitRepo: Repository<GroupExpenseSplit>,
    private readonly mailerService: MailerService,
  ) {}

  async createGroupMember(groupId: string, userId: string) {
    const createMember = this.grpMemberRepo.save(
      this.grpMemberRepo.create({
        groupId,
        userId,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      }),
    );
    this.logger.log(`Group member created ${userId}`);
    return createMember;
  }

  async updateGroupMember(
    id: string,
    updateData: RequestGrpMember,
  ): Promise<GroupMember | null> {
    await this.grpMemberRepo.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });
    this.logger.log(`The group member updated by Id : ${id}`);
    return this.grpMemberRepo.findOne({ where: { id } });
  }

  async deleteGrpMember(id: string): Promise<GroupMember | null | undefined> {
    return this.dataSource.transaction(async (manager) => {
      const member = await manager.findOne(GroupMember, {
        where: { id, deletedAt: IsNull() },
      });
      if (!member) return null;

      const user = member.userId;
      const expenses = await manager
        .createQueryBuilder(GroupExpense, 'expense')
        .leftJoinAndSelect('expense.splits', 'split')
        .where('expense.deletedAt IS NULL')
        .andWhere('(expense.userId = :user OR split.memberId = :user)', {
          user,
        })
        .getMany();

      for (const expense of expenses) {
        const isUserPaidBy = expense.userId === user;
        const isUserInSplitAmong = expense.splits?.some(
          (s) => s.memberId === user && s.splitType === 'equal',
        );
        const isUserInSplitUnequal = expense.splits?.some(
          (s) => s.memberId === user && s.splitType === 'unequal',
        );
        if (isUserPaidBy || isUserInSplitAmong || isUserInSplitUnequal) {
          throw new ForbiddenException(
            `You cannot delete this user because they are involved in a group expense. Delete their expenses first.`,
          );
        }
      }

      await manager.update(GroupMember, id, { deletedAt: new Date() });
      this.logger.log(`The member deleted (soft delete) : ${id}`);
      return manager.findOne(GroupMember, { where: { id } });
    });
  }

  private formatGroupMemberRow(member: GroupMember) {
    return {
      ...mongoId(member.id),
      group: member.group ? formatGroupRef(member.group) : undefined,
      user: member.user ? formatUserRef(member.user) : undefined,
    };
  }

  async fetchGroupMemberById(id: string) {
    const member = await this.grpMemberRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['group', 'user'],
    });
    this.logger.log(`The ${id} group member fetched`);
    return member ? [this.formatGroupMemberRow(member)] : [];
  }

  async fetchGroupMembersByGroupId(
    id: string,
  ): Promise<GroupMemberWithUser[] | null> {
    const groupMembers = await this.grpMemberRepo.find({
      where: { groupId: id, deletedAt: IsNull() },
      relations: ['group', 'user'],
    });
    this.logger.log(`The group members fetched by group id : ${id}`);
    return groupMembers.map((member) => ({
      ...mongoId(member.id),
      group: member.group ? { name: member.group.name } : { name: '' },
      user: member.user
        ? {
            _id: member.user.id,
            name: member.user.name,
            email: member.user.email,
          }
        : { _id: '', name: '' },
    }));
  }

  async sendLoginCredentialsInfoToUserEmail(email: string): Promise<any> {
    const emailContent = buildWelcomeCredentialsEmail({
      email,
      password: '12345678',
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
}
