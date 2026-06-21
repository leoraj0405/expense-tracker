'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';

import {
  IconCurrencyRupee,
  IconWallet,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react';
import { Center, Loader } from '@mantine/core';
import AppShellLayout from '@/layouts/AppShellLayout';
import { PageHero } from '@/components/ui/PageHero';
import { StatCard } from '@/components/ui/StatCard';
import { Panel } from '@/components/ui/Panel';
import { DonutChart } from '@/components/ui/DonutChart';
import { ExpenseRow } from '@/components/ui/ExpenseRow';
import { DashboardDateFilter } from '@/components/ui/DashboardDateFilter';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getUserId, getCategoryName } from '@/utils/entity';
import { userService } from '@/services/userService';
import { formatCurrency, CHART_COLORS } from '@/utils/format';
import {
  type DatePreset,
  type DateRange,
  detectDatePreset,
  formatShortDateRange,
  getCurrentMonthRange,
  getPresetLabel,
} from '@/utils/date';
import type { DashboardData } from '@/types/dashboard';

const CATEGORY_EMOJI: Record<string, string> = {
  Entertainment: '🎬',
  Food: '🍔',
  Transport: '🚗',
  Stay: '🏨',
  Movies: '🍿',
  default: '💸',
};

function Dashboard() {
  const loginUser = useRequireAuth();
  const userId = getUserId(loginUser);
  const userName = loginUser?.name || loginUser?.data?.name || 'Buddy';

  const initialRange = getCurrentMonthRange();
  const [datePreset, setDatePreset] = useState<DatePreset>('thisMonth');
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(
    async (range: DateRange, initial = false) => {
      if (!userId) return;

      if (initial) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const res = await userService.dashboard(userId, {
          startDate: range.startDate,
          endDate: range.endDate,
        });
        setDashboard(res.item!);
      } catch {
        setError('Failed to load dashboard');
        setDashboard(null);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (!userId) return;
    fetchDashboard(getCurrentMonthRange(), true);
  }, [userId, fetchDashboard]);

  const handleDateFilterChange = (preset: DatePreset, range: DateRange) => {
    setDatePreset(preset);
    setDateRange(range);
    fetchDashboard(range, false);
  };

  const categoryChart = useMemo(() => {
    if (!dashboard?.categoryBreakdown.length) return [];
    return dashboard.categoryBreakdown.map((item, i) => ({
      name: item.name,
      value: item.amount,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [dashboard]);

  const recentRows = useMemo(() => {
    if (!dashboard?.recentExpenses.length) return [];
    return dashboard.recentExpenses.map((expense, index) => {
      const category = getCategoryName(expense.category);
      return {
        id: expense.id || String(index),
        name: expense.description,
        category,
        date: expense.date,
        amount: Number(expense.amount),
        emoji: CATEGORY_EMOJI[category] || CATEGORY_EMOJI.default,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });
  }, [dashboard]);

  const activePreset = dashboard?.period
    ? detectDatePreset({
        startDate: dashboard.period.startDate,
        endDate: dashboard.period.endDate,
      })
    : datePreset;

  const monthRange = dashboard?.period ?? dateRange;
  const periodLabel =
    activePreset === 'custom'
      ? `Custom · ${formatShortDateRange(monthRange)}`
      : getPresetLabel(activePreset);
  const stats = dashboard?.monthStats;
  const topCategory = dashboard?.topCategory;
  const balances = dashboard?.balances;

  const deltaLabel = stats
    ? `${stats.deltaUp ? '↑' : '↓'} ${Math.abs(stats.deltaPercent)}% vs last month`
    : '';

  if (isLoading && !dashboard) {
    return (
      <AppShellLayout>
        <Center py="xl">
          <Loader color="navy" />
        </Center>
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <PageHero
        title={`Welcome back, ${userName.split(' ')[0]}`}
        subtitle="Track your spending. Control your future."
        action={
          <DashboardDateFilter
            preset={activePreset}
            range={monthRange}
            onChange={handleDateFilterChange}
            disabled={isRefreshing}
          />
        }
      />

      {error && <div className="et-alert et-alert-error">{error}</div>}

      <div className={isRefreshing ? 'et-dashboard-refreshing' : undefined}>
        <div className="et-stat-grid">
          <StatCard
            label={periodLabel}
            value={formatCurrency(stats?.total ?? 0)}
            delta={deltaLabel}
            deltaClass={stats?.deltaUp ? 'et-delta-up' : 'et-delta-down'}
            icon={<IconCurrencyRupee size={16} stroke={2} />}
            iconStyle={{ background: 'var(--et-amber-soft)', color: '#a3691b' }}
          />
          <StatCard
            label="Top category"
            value={topCategory?.name ?? '—'}
            delta={topCategory ? `${topCategory.pct}% of spend` : 'No expenses yet'}
            icon={<IconWallet size={16} stroke={2} />}
            iconStyle={{ background: 'var(--et-green-soft)', color: 'var(--et-green)' }}
          />
          <StatCard
            label="You're owed"
            value={formatCurrency(balances?.owedToYou ?? 0)}
            delta={`across ${balances?.owedGroupsCount ?? 0} group${balances?.owedGroupsCount === 1 ? '' : 's'}`}
            icon={<IconArrowUp size={16} stroke={2} />}
            iconStyle={{ background: 'var(--et-green-soft)', color: 'var(--et-green)' }}
            valueStyle={{ color: 'var(--et-green)' }}
          />
          <StatCard
            label="You owe"
            value={formatCurrency(balances?.youOwe ?? 0)}
            delta={
              balances?.topOweTo
                ? `to ${balances.topOweTo.name}`
                : 'All settled up'
            }
            icon={<IconArrowDown size={16} stroke={2} />}
            iconStyle={{ background: 'var(--et-red-soft)', color: 'var(--et-red)' }}
            valueStyle={{ color: 'var(--et-red)' }}
          />
        </div>

        <div className="et-content-grid">
          <Panel
            title="Recent expenses"
            hint="Your latest activity"
            action={
              <Link
                href={`/expense?startDate=${monthRange.startDate}&endDate=${monthRange.endDate}`}
                className="et-link-btn"
              >
                See all →
              </Link>
            }
          >
            {recentRows.length === 0 ? (
              <p className="et-empty-note">No expenses yet. Add your first one!</p>
            ) : (
              recentRows.map((exp) => (
                <ExpenseRow
                  key={exp.id}
                  name={exp.name}
                  category={exp.category}
                  date={exp.date}
                  amount={exp.amount}
                  emoji={exp.emoji}
                  color={exp.color}
                />
              ))
            )}
          </Panel>

          <Panel
            title={`${periodLabel}, by category`}
            hint={`${formatCurrency(stats?.total ?? 0)} total`}
          >
            <DonutChart segments={categoryChart} />
          </Panel>
        </div>

        {dashboard?.groups && dashboard.groups.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <Panel title="Your groups" hint={`${dashboard.groups.length} active`}>
              <ResponsiveGroupList groups={dashboard.groups} />
            </Panel>
          </div>
        )}
      </div>
    </AppShellLayout>
  );
}

function ResponsiveGroupList({
  groups,
}: {
  groups: DashboardData['groups'];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groups.map((group) => (
        <Link
          key={group.id || group._id}
          href={`/group/groupexpense?grpid=${group.id || group._id}&grpname=${encodeURIComponent(group.name)}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 0',
            borderBottom: '1px solid var(--et-line)',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{group.name}</div>
            <div style={{ fontSize: 12, color: 'var(--et-ink-soft)', marginTop: 2 }}>
              {group.memberCount} members · {group.expenseCount} expenses ·{' '}
              {formatCurrency(group.totalExpense)} total
            </div>
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: group.yourBalance >= 0 ? 'var(--et-green)' : 'var(--et-red)',
            }}
          >
            {group.yourBalance >= 0 ? '+' : ''}
            {formatCurrency(Math.abs(group.yourBalance))}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Dashboard;
