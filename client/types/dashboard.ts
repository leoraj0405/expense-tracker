import type { Expense, User } from './entities';

export interface DashboardCategoryBreakdown {
  name: string;
  amount: number;
  pct: number;
}

export interface DashboardBalances {
  owedToYou: number;
  youOwe: number;
  owedGroupsCount: number;
  topOweTo: { name: string; amount: number } | null;
}

export interface DashboardGroupSummary {
  id: string;
  _id?: string;
  name: string;
  memberCount: number;
  expenseCount: number;
  totalExpense: number;
  yourBalance: number;
  createdBy?: User;
}

export interface DashboardData {
  user: User & { profileUrl?: string | null };
  period: {
    startDate: string;
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
  };
  monthStats: {
    total: number;
    previousMonthTotal: number;
    deltaPercent: number;
    deltaUp: boolean;
  };
  topCategory: DashboardCategoryBreakdown | null;
  categoryBreakdown: DashboardCategoryBreakdown[];
  recentExpenses: Expense[];
  balances: DashboardBalances;
  groups: DashboardGroupSummary[];
}
