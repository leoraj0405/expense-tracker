'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

import { Center, Loader, Text } from '@mantine/core';
import AppShellLayout from '@/layouts/AppShellLayout';
import { PageHero } from '@/components/ui/PageHero';
import { Panel } from '@/components/ui/Panel';
import { DonutChart } from '@/components/ui/DonutChart';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useQueryParams } from '@/hooks/useQueryParams';
import { getUserId, getEntityId } from '@/utils/entity';
import { groupExpenseService } from '@/services/groupExpenseService';
import { groupMemberService } from '@/services/groupMemberService';
import { CHART_COLORS, formatCurrency } from '@/utils/format';
import { ApiError } from '@/services/apiClient';
import type { GroupExpense } from '@/types/entities';

type ExpenseGroupMap = Record<string, Record<string, number>>;

function Settlements() {
  const query = useQueryParams();
  const loginUser = useRequireAuth();

  const groupId = query.get('grpid');
  const groupName = query.get('grpname') || 'Group';

  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [groupExpenses, setGroupedExpenses] = useState<ExpenseGroupMap>({});
  const [isLoading, setIsLoading] = useState(true);

  const chartSegments = useMemo(
    () =>
      expenses
        .map((item) => ({
          name: item.description?.trim() || 'Expense',
          value: Number(item.amount),
        }))
        .filter((item) => item.value > 0)
        .map((item, index) => ({
          ...item,
          color: CHART_COLORS[index % CHART_COLORS.length],
        })),
    [expenses],
  );

  const chartTotal = useMemo(
    () => chartSegments.reduce((sum, segment) => sum + segment.value, 0),
    [chartSegments],
  );

  const fetchExpenses = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    try {
      const res = await groupExpenseService.listByGroup(groupId);
      setExpenses(res.items);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error('Error fetching expenses:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;

    try {
      const res = await groupMemberService.listByGroup(groupId);
      const membersMap = res.items.reduce<Record<string, string>>((acc, member) => {
        const memberUserId = getEntityId(member.user);
        if (memberUserId) {
          acc[memberUserId] = member.user?.name || 'User';
        }
        return acc;
      }, {});
      setMembers(membersMap);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error('Error fetching members:', err.message);
      }
    }
  }, [groupId]);

  const groupExpensesSummary = useCallback((data: GroupExpense[]) => {
    const expenseGroup: ExpenseGroupMap = {};

    data.forEach((expense) => {
      const paidUserId = getEntityId(expense.user);
      if (!paidUserId) return;

      const splits = [];
      if (expense.splitUnequal) {
        splits.push(...expense.splitUnequal.filter((s) => s.memberId !== paidUserId));
      }
      if (expense.splitAmong) {
        splits.push(...expense.splitAmong.filter((s) => s.memberId !== paidUserId));
      }

      if (splits.length > 0) {
        if (!expenseGroup[paidUserId]) expenseGroup[paidUserId] = {};
        splits.forEach(({ memberId, share }) => {
          expenseGroup[paidUserId][memberId] = (expenseGroup[paidUserId][memberId] || 0) + share;
        });
      }
    });

    Object.entries(expenseGroup).forEach(([payerId, owes]) => {
      Object.entries(owes).forEach(([owedId, amount]) => {
        if (expenseGroup[owedId]?.[payerId] !== undefined) {
          const oweAmount = expenseGroup[owedId][payerId];
          if (amount > oweAmount) {
            expenseGroup[payerId][owedId] = amount - oweAmount;
            delete expenseGroup[owedId][payerId];
          } else if (amount < oweAmount) {
            expenseGroup[owedId][payerId] = oweAmount - amount;
            delete expenseGroup[payerId][owedId];
          } else {
            delete expenseGroup[payerId][owedId];
            delete expenseGroup[owedId][payerId];
          }
        }
      });
    });

    Object.keys(expenseGroup).forEach((key) => {
      if (Object.keys(expenseGroup[key]).length === 0) delete expenseGroup[key];
    });

    return expenseGroup;
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchMembers();
  }, [fetchExpenses, fetchMembers]);

  useEffect(() => {
    if (expenses.length > 0) {
      setGroupedExpenses(groupExpensesSummary(expenses));
    }
  }, [expenses, groupExpensesSummary]);

  const expenseRows = isLoading ? (
    <tr className="et-tr-full">
      <td colSpan={6}>
        <Center py="xl">
          <Loader color="navy" />
        </Center>
      </td>
    </tr>
  ) : expenses.length === 0 ? (
    <tr className="et-tr-full">
      <td colSpan={6}>
        <p className="et-empty-note">No records</p>
      </td>
    </tr>
  ) : (
    expenses.map((item, index) => {
      const splitMethod = item.splitAmong ? 'Equal' : 'Unequal';
      return (
        <tr key={getEntityId(item) || index}>
          <td data-label="S No">{index + 1}</td>
          <td data-label="Description">{item.description}</td>
          <td data-label="Paid By">{item.user?.name || 'User'}</td>
          <td data-label="Total Amount">₹{item.amount}</td>
          <td data-label="Split Method">
            <span className="et-cat-pill" style={{ background: 'var(--et-surface)' }}>
              {splitMethod}
            </span>
          </td>
          <td data-label="Shares">
            {item.splitAmong && <div>Each member ₹{item.splitAmong[0]?.share}</div>}
            {item.splitUnequal?.map((shareItem, shareIndex) => (
              <div key={shareIndex}>
                {members[shareItem.memberId] || 'User'}: ₹{shareItem.share}
              </div>
            ))}
          </td>
        </tr>
      );
    })
  );

  const SettlementItem = ({ payerId, owes }: { payerId: string; owes: Record<string, number> }) => (
    <div
      key={payerId}
      style={{
        padding: '13px 14px',
        borderRadius: 12,
        border: '1px solid var(--et-line)',
        marginBottom: 10,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>To pay {members[payerId] || 'User'}</div>
      {Object.entries(owes).map(([owedId, amount]) => (
        <div key={owedId} style={{ fontSize: 13.5, marginTop: 4 }}>
          {members[owedId] || 'User'}: ₹{amount}
        </div>
      ))}
    </div>
  );

  const SettlementItemToUser = ({
    payerId,
    owes,
  }: {
    payerId: string;
    owes: Record<string, number>;
  }) => {
    const loginUserId = getUserId(loginUser);
    const isLoginUserInvolved =
      payerId === loginUserId || (loginUserId ? Object.hasOwn(owes, loginUserId) : false);
    if (!isLoginUserInvolved) return null;

    return (
      <div
        key={payerId}
        style={{
          padding: '13px 14px',
          borderRadius: 12,
          border: '1px solid var(--et-line)',
          marginBottom: 10,
          background: 'var(--et-amber-soft)',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          {payerId === loginUserId
            ? 'Others need to pay you'
            : `You need to pay ${members[payerId] || 'User'}`}
        </div>
        {Object.entries(owes).map(([owedId, amount]) => {
          if (payerId === loginUserId && owedId !== loginUserId) {
            return (
              <div key={owedId} style={{ fontSize: 13.5, marginTop: 4 }}>
                {members[owedId] || 'User'}: ₹{amount}
              </div>
            );
          }
          if (owedId === loginUserId) {
            return (
              <div key={owedId} style={{ fontSize: 13.5, marginTop: 4 }}>
                {members[payerId] || 'User'}: ₹{amount}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <AppShellLayout>
      <PageHero
        title={`${groupName} — Settlements`}
        subtitle="Who owes whom across this group."
      />

      <div className="et-settle-grid">
        <Panel title="Expense summary" hint={groupName}>
          {isLoading ? (
            <Center py="xl">
              <Loader color="navy" />
            </Center>
          ) : chartSegments.length > 0 ? (
            <>
              <DonutChart segments={chartSegments} size={180} />
              <Text size="sm" c="dimmed" mt="md">
                {formatCurrency(chartTotal)} total across {chartSegments.length} expense
                {chartSegments.length === 1 ? '' : 's'}
              </Text>
            </>
          ) : (
            <p className="et-empty-note">No chart data available</p>
          )}
        </Panel>

        <Panel title="Your settlements" hint="Personal balance">
          {Object.keys(groupExpenses).length === 0 ? (
            <p className="et-empty-note">No settlements for you</p>
          ) : (
            Object.entries(groupExpenses).map(([payerId, owes]) => (
              <SettlementItemToUser key={payerId} payerId={payerId} owes={owes} />
            ))
          )}
        </Panel>
      </div>

      <div style={{ marginTop: 20 }}>
        <Panel title="Expense details" hint={`${expenses.length} records`}>
          <ResponsiveTable minWidth={760}>
            <thead>
              <tr>
                <th>S No</th>
                <th>Description</th>
                <th>Paid By</th>
                <th>Total Amount</th>
                <th>Split Method</th>
                <th>Shares</th>
              </tr>
            </thead>
            <tbody>{expenseRows}</tbody>
          </ResponsiveTable>
        </Panel>
      </div>

      <div style={{ marginTop: 20 }}>
        <Panel title="Overall member settlements" hint="All outstanding payments">
          {Object.keys(groupExpenses).length === 0 ? (
            <p className="et-empty-note">All settled up!</p>
          ) : (
            Object.entries(groupExpenses).map(([payerId, owes]) => (
              <SettlementItem key={payerId} payerId={payerId} owes={owes} />
            ))
          )}
        </Panel>
      </div>
    </AppShellLayout>
  );
}

export default Settlements;
