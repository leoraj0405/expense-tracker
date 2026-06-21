import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { RequestGrpExpense } from '../request';
import { GroupExpense } from '../entities/group-expense.entity';
import { GroupExpenseSplit } from '../entities/group-expense-split.entity';
import { GrpMemberService } from '../groupMember/grpMember.service';
import {
  formatCategoryRef,
  formatGroupRef,
  formatUserRef,
  mongoId,
} from '../utils/mongo-compat';

@Injectable()
export class GrpExpenseService {
  private readonly logger = new Logger(GrpExpenseService.name);

  constructor(
    @InjectRepository(GroupExpense)
    private groupExpenseRepo: Repository<GroupExpense>,
    @InjectRepository(GroupExpenseSplit)
    private splitRepo: Repository<GroupExpenseSplit>,
    private readonly memberService: GrpMemberService,
  ) {}

  private formatSplits(splits: GroupExpenseSplit[]) {
    const splitAmong = splits
      .filter((s) => s.splitType === 'equal')
      .map((s) => ({
        memberId: s.memberId,
        share: Number(s.share),
        isSettle: s.isSettle,
      }));
    const splitUnequal = splits
      .filter((s) => s.splitType === 'unequal')
      .map((s) => ({
        memberId: s.memberId,
        share: Number(s.share),
        isSettle: s.isSettle,
      }));
    return {
      splitAmong: splitAmong.length ? splitAmong : undefined,
      splitUnequal: splitUnequal.length ? splitUnequal : undefined,
    };
  }

  private formatGroupExpenseRow(expense: GroupExpense, splits: GroupExpenseSplit[]) {
    const { splitAmong, splitUnequal } = this.formatSplits(splits);
    return {
      ...mongoId(expense.id),
      description: expense.description,
      amount: expense.amount,
      splitAmong,
      splitUnequal,
      group: expense.group ? formatGroupRef(expense.group) : undefined,
      category: expense.category ? formatCategoryRef(expense.category) : undefined,
      user: expense.user ? formatUserRef(expense.user) : undefined,
    };
  }

  private async saveSplits(
    groupExpenseId: string,
    splitAmong: { memberId: string; share: number }[] | null,
    splitUnequal: { memberId: string; share: number }[] | null,
  ) {
    await this.splitRepo.delete({ groupExpenseId });
    const splits: Partial<GroupExpenseSplit>[] = [];

    splitAmong?.forEach((s) => {
      splits.push({
        groupExpenseId,
        memberId: s.memberId,
        share: s.share,
        splitType: 'equal',
        isSettle: false,
        createdAt: new Date(),
      });
    });

    splitUnequal?.forEach((s) => {
      splits.push({
        groupExpenseId,
        memberId: s.memberId,
        share: s.share,
        splitType: 'unequal',
        isSettle: false,
        createdAt: new Date(),
      });
    });

    if (splits.length) {
      await this.splitRepo.save(splits);
    }
  }

  async createGroupExpense({
    groupId,
    description,
    amount,
    userId,
    categoryId,
    usersAndShares,
    splitMethod,
  }: RequestGrpExpense) {
    const inputs = {
      groupId,
      description,
      amount,
      userId,
      categoryId,
      splitAmong: null as { memberId: string; share: number }[] | null,
      splitUnequal: null as typeof usersAndShares | null,
    };

    if (splitMethod === 'equal') {
      const splitEqualArr: { memberId: string; share: number }[] = [];
      const groupMembersArr =
        await this.memberService.fetchGroupMembersByGroupId(groupId);

      if (!groupMembersArr || groupMembersArr.length === 0) {
        throw new Error('No group members found for equal split.');
      }

      const membersId = groupMembersArr.map((member) => member.user._id);
      const totalAmount = Number(amount);
      const memberCount = membersId.length;
      const baseShare = Math.floor(totalAmount / memberCount);
      let remainder = totalAmount - baseShare * memberCount;

      membersId.forEach((memberId) => {
        const share = baseShare + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        splitEqualArr.push({ memberId, share });
      });

      inputs.splitAmong = splitEqualArr;
    } else {
      let total = 0;
      usersAndShares.map((item) => {
        total += Number(item.share);
      });
      if (total !== Number(amount)) {
        return 'Users share amount higher or lower than expense amount';
      }
      inputs.splitUnequal = usersAndShares;
    }

    const expense = await this.groupExpenseRepo.save(
      this.groupExpenseRepo.create({
        groupId: inputs.groupId,
        description: inputs.description,
        amount: inputs.amount,
        userId: inputs.userId,
        categoryId: inputs.categoryId,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      }),
    );

    await this.saveSplits(expense.id, inputs.splitAmong, inputs.splitUnequal);
    this.logger.log(`The Group expense created`);
    return expense;
  }

  async updateGroupExpenseById(
    id: string,
    updateData: RequestGrpExpense,
  ): Promise<GroupExpense | null> {
    const inputs = {
      groupId: updateData.groupId,
      description: updateData.description,
      amount: updateData.amount,
      userId: updateData.userId,
      categoryId: updateData.categoryId,
      splitAmong: null as { memberId: string; share: number }[] | null,
      splitUnequal:
        Array.isArray(updateData.usersAndShares) &&
        updateData.usersAndShares.length > 0
          ? updateData.usersAndShares
          : null,
    };

    if (updateData.splitMethod === 'equal') {
      inputs.splitUnequal = null;
      const splitEqualArr: { memberId: string; share: number }[] = [];
      const groupMembersArr =
        await this.memberService.fetchGroupMembersByGroupId(updateData.groupId);
      const membersId = groupMembersArr?.map((member) => member.user._id);

      membersId?.forEach((memberId) => {
        splitEqualArr.push({
          memberId,
          share: Math.round(updateData.amount / membersId.length),
        });
      });

      inputs.splitAmong = splitEqualArr;
    } else {
      let total = 0;
      updateData.usersAndShares.map((item) => {
        total += Number(item.share);
      });
      if (total !== Number(updateData.amount)) {
        throw new HttpException(
          'Users share amount higher or lower than expense amount',
          HttpStatus.BAD_REQUEST,
        );
      }
      inputs.splitUnequal = updateData.usersAndShares;
    }

    await this.groupExpenseRepo.update(id, {
      groupId: inputs.groupId,
      description: inputs.description,
      amount: inputs.amount,
      userId: inputs.userId,
      categoryId: inputs.categoryId,
      updatedAt: new Date(),
    });

    await this.saveSplits(id, inputs.splitAmong, inputs.splitUnequal);
    this.logger.log(
      `The Group expense updated by Id : ${id} the values : ${updateData}`,
    );

    return this.groupExpenseRepo.findOne({ where: { id } });
  }

  async deleteGroupExpenseById(id: string): Promise<GroupExpense | null> {
    await this.groupExpenseRepo.update(id, { deletedAt: new Date() });
    this.logger.log(`The Group expense ${id} deleted (soft delete)`);
    return this.groupExpenseRepo.findOne({ where: { id } });
  }

  private async loadExpenseWithRelations(id: string) {
    return this.groupExpenseRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['group', 'user', 'category'],
    });
  }

  async getGroupExpenseById(id: string) {
    const expense = await this.loadExpenseWithRelations(id);
    if (!expense) return [];
    const splits = await this.splitRepo.find({ where: { groupExpenseId: id } });
    this.logger.log(`The group expense fetch by Id : ${id}`);
    return [this.formatGroupExpenseRow(expense, splits)];
  }

  async getGroupExpensesByGroupId(id: string) {
    const expenses = await this.groupExpenseRepo.find({
      where: { groupId: id, deletedAt: IsNull() },
      relations: ['group', 'user', 'category'],
    });
    const results = await Promise.all(
      expenses.map(async (expense) => {
        const splits = await this.splitRepo.find({
          where: { groupExpenseId: expense.id },
        });
        return this.formatGroupExpenseRow(expense, splits);
      }),
    );
    this.logger.log(`The group expense fetch by group Id : ${id}`);
    return results;
  }

  async getExpensesByUserId(userId: string, groupId: string) {
    const expenses = await this.groupExpenseRepo.find({
      where: { userId, groupId, deletedAt: IsNull() },
      relations: ['group', 'user', 'category'],
    });
    const results = await Promise.all(
      expenses.map(async (expense) => {
        const splits = await this.splitRepo.find({
          where: { groupExpenseId: expense.id },
        });
        return this.formatGroupExpenseRow(expense, splits);
      }),
    );
    this.logger.log(
      `The group expense fetch by user Id : ${userId} in group ${groupId}`,
    );
    return results;
  }
}
