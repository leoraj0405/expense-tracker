import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Expense } from '../entities/expense.entity';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { GroupExpense } from '../entities/group-expense.entity';
import { GroupExpenseSplit } from '../entities/group-expense-split.entity';
import {
  formatCategoryRef,
  formatUserRef,
  mongoId,
} from '../utils/mongo-compat';
import {
  formatApiDate,
  getPreviousMonthBounds,
  resolveExpenseDateRange,
} from '../utils/date.util';

type SplitRow = { memberId: string; share: number };

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Expense) private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
    @InjectRepository(GroupExpense)
    private readonly groupExpenseRepo: Repository<GroupExpense>,
    @InjectRepository(GroupExpenseSplit)
    private readonly splitRepo: Repository<GroupExpenseSplit>,
  ) {}

  async getDashboard(userId: string, startDate?: string, endDate?: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentRange = resolveExpenseDateRange({ startDate, endDate });
    const previousRange = getPreviousMonthBounds(currentRange.start);

    const [
      currentExpenses,
      previousTotal,
      groups,
      globalBalances,
    ] = await Promise.all([
      this.fetchExpensesInRange(userId, currentRange.start, currentRange.end),
      this.sumExpensesInRange(
        userId,
        previousRange.start,
        previousRange.end,
      ),
      this.buildGroupDetails(userId),
      this.computeGlobalBalances(userId),
    ]);

    const monthTotal = this.sumAmounts(currentExpenses);
    const deltaPercent = this.calcDeltaPercent(monthTotal, previousTotal);

    const categoryBreakdown = this.buildCategoryBreakdown(currentExpenses);
    const topCategory = categoryBreakdown[0] ?? null;

    const recentExpenses = currentExpenses
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((e) => this.formatExpense(e));

    this.logger.log(`Dashboard fetched for user ${userId}`);

    return {
      user: {
        ...mongoId(user.id),
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        profileUrl: user.profileImage ? `/uploads/${user.profileImage}` : null,
      },
      period: {
        startDate: formatApiDate(currentRange.start),
        endDate: formatApiDate(currentRange.end),
        previousStartDate: formatApiDate(previousRange.start),
        previousEndDate: formatApiDate(previousRange.end),
      },
      monthStats: {
        total: monthTotal,
        previousMonthTotal: previousTotal,
        deltaPercent,
        deltaUp: monthTotal >= previousTotal,
      },
      topCategory: topCategory
        ? {
            name: topCategory.name,
            amount: topCategory.amount,
            pct: topCategory.pct,
          }
        : null,
      categoryBreakdown,
      recentExpenses,
      balances: globalBalances,
      groups,
    };
  }

  private async fetchExpensesInRange(userId: string, start: Date, end: Date) {
    return this.expenseRepo.find({
      where: {
        userId,
        deletedAt: IsNull(),
        date: Between(start, end),
      },
      relations: ['category', 'user'],
      order: { date: 'DESC' },
    });
  }

  private async sumExpensesInRange(userId: string, start: Date, end: Date) {
    const expenses = await this.fetchExpensesInRange(userId, start, end);
    return this.sumAmounts(expenses);
  }

  private sumAmounts(expenses: Expense[]) {
    return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }

  private calcDeltaPercent(current: number, previous: number) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  private buildCategoryBreakdown(expenses: Expense[]) {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      const name = e.category?.name || 'Uncategorized';
      map.set(name, (map.get(name) || 0) + Number(e.amount));
    });

    const total = this.sumAmounts(expenses);
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        pct: total > 0 ? Math.round((amount / total) * 100) : 0,
      }));
  }

  private formatExpense(expense: Expense) {
    return {
      ...mongoId(expense.id),
      description: expense.description,
      amount: Number(expense.amount),
      date: expense.date,
      category: expense.category
        ? formatCategoryRef(expense.category)
        : undefined,
      user: expense.user ? formatUserRef(expense.user) : undefined,
    };
  }

  private async buildGroupDetails(userId: string) {
    const memberships = await this.groupMemberRepo.find({
      where: { userId, deletedAt: IsNull() },
    });
    const groupIds = memberships.map((m) => m.groupId);
    if (!groupIds.length) return [];

    const groups = await this.groupRepo.find({
      where: { id: In(groupIds), deletedAt: IsNull() },
      relations: ['creator'],
    });

    return Promise.all(
      groups.map(async (group) => {
        const [members, expenses, netBalance] = await Promise.all([
          this.groupMemberRepo.count({
            where: { groupId: group.id, deletedAt: IsNull() },
          }),
          this.groupExpenseRepo.find({
            where: { groupId: group.id, deletedAt: IsNull() },
          }),
          this.computeGroupNetBalance(group.id, userId),
        ]);

        const totalExpense = expenses.reduce(
          (sum, e) => sum + Number(e.amount),
          0,
        );

        return {
          ...mongoId(group.id),
          name: group.name,
          memberCount: members,
          expenseCount: expenses.length,
          totalExpense,
          yourBalance: netBalance,
          createdBy: group.creator
            ? formatUserRef(group.creator)
            : undefined,
        };
      }),
    );
  }

  private async computeGroupNetBalance(groupId: string, userId: string) {
    const balances = await this.computeGroupMemberBalances(groupId);
    return balances[userId] ?? 0;
  }

  private async computeGroupMemberBalances(groupId: string) {
    const expenses = await this.groupExpenseRepo.find({
      where: { groupId, deletedAt: IsNull() },
    });

    const balances: Record<string, number> = {};

    for (const expense of expenses) {
      const splits = await this.splitRepo.find({
        where: { groupExpenseId: expense.id },
      });
      const payerId = expense.userId;
      const splitRows = this.normalizeSplits(splits);

      splitRows.forEach(({ memberId, share }) => {
        if (memberId === payerId) return;
        balances[payerId] = (balances[payerId] || 0) + share;
        balances[memberId] = (balances[memberId] || 0) - share;
      });
    }

    return balances;
  }

  private normalizeSplits(splits: GroupExpenseSplit[]): SplitRow[] {
    const rows: SplitRow[] = [];
    splits.forEach((s) => {
      rows.push({ memberId: s.memberId, share: Number(s.share) });
    });
    return rows;
  }

  private async computeGlobalBalances(userId: string) {
    const memberships = await this.groupMemberRepo.find({
      where: { userId, deletedAt: IsNull() },
    });
    const groupIds = [...new Set(memberships.map((m) => m.groupId))];

    let owedToYou = 0;
    let youOwe = 0;
    const debtByPerson = new Map<string, { name: string; amount: number }>();

    let owedGroupsCount = 0;

    for (const groupId of groupIds) {
      const pairwise = await this.computeGroupPairwiseDebts(groupId);
      const hasUserDebt = pairwise.some(
        (p) => p.fromId === userId || p.toId === userId,
      );
      if (hasUserDebt) owedGroupsCount += 1;

      const members = await this.groupMemberRepo.find({
        where: { groupId, deletedAt: IsNull() },
        relations: ['user'],
      });
      const nameById = new Map(
        members.map((m) => [m.userId, m.user?.name || 'User']),
      );

      pairwise.forEach(({ fromId, toId, amount }) => {
        if (toId === userId) {
          owedToYou += amount;
        }
        if (fromId === userId) {
          youOwe += amount;
          const name = nameById.get(toId) || 'User';
          const existing = debtByPerson.get(toId);
          if (existing) {
            existing.amount += amount;
          } else {
            debtByPerson.set(toId, { name, amount });
          }
        }
      });
    }

    const topOweTo = [...debtByPerson.values()].sort(
      (a, b) => b.amount - a.amount,
    )[0] ?? null;

    return {
      owedToYou: Math.round(owedToYou * 100) / 100,
      youOwe: Math.round(youOwe * 100) / 100,
      owedGroupsCount: groupIds.length > 0 ? owedGroupsCount : 0,
      topOweTo: topOweTo
        ? { name: topOweTo.name, amount: Math.round(topOweTo.amount * 100) / 100 }
        : null,
    };
  }

  /** Simplified pairwise debts (who pays whom) for a group. */
  private async computeGroupPairwiseDebts(groupId: string) {
    const expenses = await this.groupExpenseRepo.find({
      where: { groupId, deletedAt: IsNull() },
    });

    const owedMap: Record<string, Record<string, number>> = {};

    for (const expense of expenses) {
      const payerId = expense.userId;
      const splits = await this.splitRepo.find({
        where: { groupExpenseId: expense.id },
      });

      this.normalizeSplits(splits).forEach(({ memberId, share }) => {
        if (memberId === payerId) return;
        if (!owedMap[payerId]) owedMap[payerId] = {};
        owedMap[payerId][memberId] = (owedMap[payerId][memberId] || 0) + share;
      });
    }

    // Net bilateral debts
    Object.entries(owedMap).forEach(([payerId, owes]) => {
      Object.entries(owes).forEach(([owedId, amount]) => {
        if (owedMap[owedId]?.[payerId] !== undefined) {
          const reverse = owedMap[owedId][payerId];
          if (amount > reverse) {
            owedMap[payerId][owedId] = amount - reverse;
            delete owedMap[owedId][payerId];
          } else if (amount < reverse) {
            owedMap[owedId][payerId] = reverse - amount;
            delete owedMap[payerId][owedId];
          } else {
            delete owedMap[payerId][owedId];
            delete owedMap[owedId][payerId];
          }
        }
      });
    });

    const result: { fromId: string; toId: string; amount: number }[] = [];
    Object.entries(owedMap).forEach(([payerId, owes]) => {
      Object.entries(owes).forEach(([owedId, amount]) => {
        if (amount > 0) {
          result.push({ fromId: owedId, toId: payerId, amount });
        }
      });
    });

    return result;
  }
}
