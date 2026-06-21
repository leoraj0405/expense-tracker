'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import {
  Center,
  Loader,
  Pagination,
  Select,
} from '@mantine/core';
import {
  IconCurrencyRupee,
  IconReceipt,
  IconCategory,
  IconChartBar,
  IconMail,
  IconCalendar,
} from '@tabler/icons-react';
import ParentShellLayout from '@/layouts/ParentShellLayout';
import { PageHero } from '@/components/ui/PageHero';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { DonutChart } from '@/components/ui/DonutChart';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { ExpenseMonthFilter } from '@/components/ui/ExpenseMonthFilter';
import { userService } from '@/services/userService';
import { expenseService } from '@/services/expenseService';
import { ApiError } from '@/services/apiClient';
import {
  getParentToken,
  getParentChildren,
  saveParentSession,
} from '@/utils/authStorage';
import { getCategoryName, getEntityId } from '@/utils/entity';
import {
  getCurrentMonthRange,
  formatDisplayDate,
} from '@/utils/date';
import { formatCurrency, CHART_COLORS, getInitials } from '@/utils/format';
import type { User, Expense } from '@/types/entities';

const PAGE_SIZE = 10;
const SUMMARY_LIMIT = 200;

interface MonthRange {
  startDate: string;
  endDate: string;
  monthKey: string;
}

function ParentHome() {
  const router = useRouter();

  const [children, setChildren] = useState<User[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [monthRange, setMonthRange] = useState<MonthRange>(() => {
    const range = getCurrentMonthRange();
    return {
      ...range,
      monthKey: range.startDate.slice(0, 7),
    };
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summaryExpenses, setSummaryExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkParentAuth = useCallback(async () => {
    if (!getParentToken()) {
      router.push('/parentlogin');
      return;
    }

    const cached = getParentChildren<User>();
    if (cached.length) {
      setChildren(cached);
      setSelectedChildId((current) => {
        if (current) return current;
        return cached.length === 1 ? getEntityId(cached[0]) || '' : '';
      });
    }

    setIsLoadingChildren(true);
    try {
      const res = await userService.parentHome();
      setChildren(res.items);
      saveParentSession({ token: getParentToken() || '', children: res.items });
      setSelectedChildId((current) => {
        if (current && res.items.some((c) => getEntityId(c) === current)) {
          return current;
        }
        return res.items.length ? getEntityId(res.items[0]) || '' : '';
      });
    } catch (err) {
      if (err instanceof ApiError) {
        router.push('/parentlogin');
      } else {
        setError('Failed to load children');
      }
    } finally {
      setIsLoadingChildren(false);
    }
  }, [router]);

  useEffect(() => {
    checkParentAuth();
  }, [checkParentAuth]);

  const selectedChild = useMemo(
    () => children.find((child) => getEntityId(child) === selectedChildId) ?? null,
    [children, selectedChildId],
  );

  const fetchSummary = useCallback(async () => {
    if (!selectedChildId) return;

    try {
      const res = await expenseService.listByUser(selectedChildId, {
        page: 1,
        limit: SUMMARY_LIMIT,
        startDate: monthRange.startDate,
        endDate: monthRange.endDate,
        parentAuth: true,
      });
      setSummaryExpenses(res.items);
      setTotalExpenses(res.item?.total ?? res.items.length);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load summary';
      setError(msg);
    }
  }, [selectedChildId, monthRange]);

  const fetchExpenses = useCallback(async () => {
    if (!selectedChildId) return;

    setIsLoadingExpenses(true);
    setError(null);

    try {
      const res = await expenseService.listByUser(selectedChildId, {
        page: currentPage,
        limit: PAGE_SIZE,
        startDate: monthRange.startDate,
        endDate: monthRange.endDate,
        parentAuth: true,
      });

      const total = res.item?.total ?? 0;
      const limit = res.item?.limit ?? PAGE_SIZE;
      setExpenses(res.items);
      setTotalExpenses(total);
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch expenses';
      setError(msg);
      setExpenses([]);
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [selectedChildId, currentPage, monthRange]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const stats = useMemo(() => {
    const items = summaryExpenses;
    const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
    const count = totalExpenses || items.length;

    const categoryMap = new Map<string, number>();
    items.forEach((item) => {
      const name = getCategoryName(item.category);
      categoryMap.set(name, (categoryMap.get(name) || 0) + Number(item.amount));
    });

    const topCategory = [...categoryMap.entries()].sort((a, b) => b[1] - a[1])[0];
    const avg = items.length ? total / items.length : 0;

    const lastExpense = items.reduce<Expense | null>((latest, item) => {
      if (!item.createdAt) return latest;
      if (!latest?.createdAt) return item;
      return new Date(item.createdAt) > new Date(latest.createdAt) ? item : latest;
    }, null);

    return {
      total,
      count,
      avg,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      lastExpenseDate: lastExpense?.createdAt?.split('T')[0] ?? null,
    };
  }, [summaryExpenses, totalExpenses]);

  const categoryChart = useMemo(() => {
    const map = new Map<string, number>();
    summaryExpenses.forEach((item) => {
      const name = getCategoryName(item.category);
      map.set(name, (map.get(name) || 0) + Number(item.amount));
    });

    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [summaryExpenses]);

  const handleMonthChange = (startDate: string, endDate: string) => {
    setMonthRange({
      startDate,
      endDate,
      monthKey: startDate.slice(0, 7),
    });
    setCurrentPage(1);
  };

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
    setCurrentPage(1);
  };

  const joinedLabel = selectedChild?.createdAt
    ? formatDisplayDate(selectedChild.createdAt.split('T')[0])
    : '—';

  return (
    <ParentShellLayout
      title="Parent portal"
      subtitle="Track how your children are spending"
    >
      <PageHero
        title="Child spending overview"
        subtitle="Select a child to review their expenses, categories, and monthly totals."
      />

      {error && <div className="et-alert et-alert-error">{error}</div>}

      {isLoadingChildren ? (
        <Center py="xl">
          <Loader color="navy" />
        </Center>
      ) : children.length === 0 ? (
        <Panel title="No children linked" hint="Account setup">
          <p className="et-empty-note">
            No child accounts are linked to your parent email yet.
          </p>
        </Panel>
      ) : (
        <>
          <Panel title="Your children" hint={`${children.length} linked account${children.length === 1 ? '' : 's'}`}>
            <div className="et-parent-child-grid">
              {children.map((child) => {
                const childId = getEntityId(child) || '';
                const isActive = childId === selectedChildId;
                return (
                  <button
                    key={childId}
                    type="button"
                    className={`et-child-card${isActive ? ' is-active' : ''}`}
                    onClick={() => handleChildSelect(childId)}
                  >
                    <div className="et-child-card-avatar">{getInitials(child.name || 'User')}</div>
                    <div className="et-child-card-body">
                      <div className="et-child-card-name">{child.name || 'User'}</div>
                      <div className="et-child-card-email">{child.email}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>

          {selectedChild && (
            <>
              <div className="et-parent-profile-row">
                <div className="et-parent-profile-card">
                  <div className="et-parent-profile-banner" aria-hidden />
                  <div className="et-parent-profile-body">
                    <div className="et-parent-profile-avatar">
                      {getInitials(selectedChild.name || 'User')}
                    </div>
                    <div className="et-parent-profile-name">{selectedChild.name}</div>
                    <div className="et-parent-profile-meta">
                      <span>
                        <IconMail size={14} /> {selectedChild.email}
                      </span>
                      <span>
                        <IconCalendar size={14} /> Member since {joinedLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <Panel title="Month filter" hint={monthRange.monthKey}>
                  <ExpenseMonthFilter
                    startDate={monthRange.startDate}
                    endDate={monthRange.endDate}
                    onChange={handleMonthChange}
                  />
                </Panel>
              </div>

              <div className="et-stat-grid">
                <StatCard
                  label="Total spent"
                  value={formatCurrency(stats.total)}
                  delta={`${stats.count} transaction${stats.count === 1 ? '' : 's'} this month`}
                  icon={<IconCurrencyRupee size={16} stroke={2} />}
                  iconStyle={{ background: 'var(--et-amber-soft)', color: '#a3691b' }}
                />
                <StatCard
                  label="Transactions"
                  value={String(stats.count)}
                  delta={stats.lastExpenseDate ? `Last: ${formatDisplayDate(stats.lastExpenseDate)}` : 'No activity yet'}
                  icon={<IconReceipt size={16} stroke={2} />}
                  iconStyle={{ background: 'var(--et-green-soft)', color: 'var(--et-green)' }}
                />
                <StatCard
                  label="Top category"
                  value={stats.topCategory?.name ?? '—'}
                  delta={
                    stats.topCategory
                      ? formatCurrency(stats.topCategory.amount)
                      : 'No category data'
                  }
                  icon={<IconCategory size={16} stroke={2} />}
                  iconStyle={{ background: 'var(--et-surface)', color: 'var(--et-navy)' }}
                />
                <StatCard
                  label="Average spend"
                  value={formatCurrency(stats.avg)}
                  delta="Per transaction"
                  icon={<IconChartBar size={16} stroke={2} />}
                  iconStyle={{ background: 'var(--et-red-soft)', color: 'var(--et-red)' }}
                />
              </div>

              <div className="et-content-grid">
                <Panel
                  title="Spending by category"
                  hint={formatCurrency(stats.total)}
                >
                  <DonutChart segments={categoryChart} />
                </Panel>

                <Panel title="Quick summary" hint="This month">
                  <div className="et-parent-summary-list">
                    <div className="et-parent-summary-item">
                      <span>Child name</span>
                      <strong>{selectedChild.name}</strong>
                    </div>
                    <div className="et-parent-summary-item">
                      <span>Email</span>
                      <strong>{selectedChild.email}</strong>
                    </div>
                    <div className="et-parent-summary-item">
                      <span>Period</span>
                      <strong>
                        {formatDisplayDate(monthRange.startDate)} –{' '}
                        {formatDisplayDate(monthRange.endDate)}
                      </strong>
                    </div>
                    <div className="et-parent-summary-item">
                      <span>Total expenses</span>
                      <strong>{formatCurrency(stats.total)}</strong>
                    </div>
                    <div className="et-parent-summary-item">
                      <span>Most spent on</span>
                      <strong>{stats.topCategory?.name ?? '—'}</strong>
                    </div>
                  </div>
                </Panel>
              </div>

              <Panel
                title="Expense history"
                hint={`Page ${currentPage} of ${totalPages}`}
              >
                {isLoadingExpenses ? (
                  <Center py="xl">
                    <Loader color="navy" />
                  </Center>
                ) : (
                  <>
                    <ResponsiveTable minWidth={640}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.length === 0 ? (
                          <tr className="et-tr-full">
                            <td colSpan={5}>
                              <p className="et-empty-note">No expenses for this period</p>
                            </td>
                          </tr>
                        ) : (
                          expenses.map((item, index) => (
                            <tr key={getEntityId(item) || index}>
                              <td data-label="#">
                                {(currentPage - 1) * PAGE_SIZE + index + 1}
                              </td>
                              <td data-label="Description">{item.description}</td>
                              <td data-label="Category">
                                <span className="et-cat-pill">{getCategoryName(item.category)}</span>
                              </td>
                              <td data-label="Amount">{formatCurrency(Number(item.amount))}</td>
                              <td data-label="Date">
                                {item.date
                                  ? formatDisplayDate(item.date.split('T')[0])
                                  : item.createdAt
                                    ? formatDisplayDate(item.createdAt.split('T')[0])
                                    : '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </ResponsiveTable>

                    {expenses.length > 0 && totalPages > 1 && (
                      <div className="et-pagination-wrap">
                        <Pagination
                          value={currentPage}
                          onChange={setCurrentPage}
                          total={totalPages}
                          color="navy"
                          disabled={isLoadingExpenses}
                        />
                      </div>
                    )}
                  </>
                )}
              </Panel>
            </>
          )}
        </>
      )}
    </ParentShellLayout>
  );
}

export default ParentHome;
