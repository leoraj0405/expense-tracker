'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

import { modals } from '@mantine/modals';
import { Center, Loader, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import CountUp from 'react-countup';
import AppShellLayout from '@/layouts/AppShellLayout';
import { PageHero } from '@/components/ui/PageHero';
import { Panel } from '@/components/ui/Panel';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useQueryParams } from '@/hooks/useQueryParams';
import { getUserId, getEntityId } from '@/utils/entity';
import { groupExpenseService } from '@/services/groupExpenseService';
import { ApiError } from '@/services/apiClient';
import type { GroupExpense } from '@/types/entities';

function GrpExpense() {
  const query = useQueryParams();
  const loginUser = useRequireAuth();

  const groupId = query.get('grpid');
  const grpName = query.get('grpname') || 'Group';
  const groupLeader = query.get('leader');
  const isGroupLeader = groupLeader === getUserId(loginUser);

  const [alert, setAlert] = useState({ visible: false, message: '' });
  const [groupExpenses, setGroupExpenses] = useState<GroupExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const colSpan = isGroupLeader ? 6 : 5;

  const fetchGroupExpenses = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    try {
      const res = await groupExpenseService.listByGroup(groupId);
      setGroupExpenses(res.items);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch expenses';
      showAlert(msg);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupExpenses();
  }, [fetchGroupExpenses]);

  const handleDelete = (id: string | null) => {
    if (!id) return;

    modals.openConfirmModal({
      title: 'Delete expense',
      children: <Text size="sm">Are you sure you want to delete this expense?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await groupExpenseService.delete(id);
          showAlert('Expense deleted successfully');
          fetchGroupExpenses();
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Deletion failed';
          showAlert(msg);
        }
      },
    });
  };

  const showAlert = (message: string) => {
    setAlert({ visible: true, message });
    setTimeout(() => setAlert({ visible: false, message: '' }), 5000);
  };

  const rows = isLoading ? (
    <tr className="et-tr-full">
      <td colSpan={colSpan}>
        <Center py="xl">
          <Loader color="navy" />
        </Center>
      </td>
    </tr>
  ) : groupExpenses.length === 0 ? (
    <tr className="et-tr-full">
      <td colSpan={colSpan}>
        <p className="et-empty-note">No expenses found</p>
      </td>
    </tr>
  ) : (
    groupExpenses.map((expense, index) => (
      <tr key={getEntityId(expense) || index}>
        <td data-label="S No">{index + 1}</td>
        <td data-label="Paid By">{expense.user?.name || 'New user (profile not updated)'}</td>
        <td data-label="Description">{expense.description || '-'}</td>
        <td data-label="Amount">
          <CountUp end={expense.amount} prefix="₹" separator="," />
        </td>
        <td data-label="Category">{expense.category?.name || '-'}</td>
        {isGroupLeader && (
          <td data-label="Actions" className="et-td-actions">
            <div className="et-actions-wrap">
              <Link
                href={`/group/groupexpense/editgroupexpense?grpexpid=${getEntityId(expense)}&grpid=${groupId}&grpname=${grpName}&leader=${groupLeader}`}
                className="et-btn et-btn-ghost et-btn-sm"
              >
                <IconEdit size={14} /> Edit
              </Link>
              <button
                type="button"
                className="et-btn et-btn-ghost et-btn-sm"
                style={{ color: 'var(--et-red)' }}
                onClick={() => handleDelete(getEntityId(expense))}
              >
                <IconTrash size={14} /> Delete
              </button>
            </div>
          </td>
        )}
      </tr>
    ))
  );

  return (
    <AppShellLayout>
      <PageHero
        title={`${grpName} — Expenses`}
        subtitle="Shared group transactions and splits."
        action={
          <Link
            href={`/group/groupexpense/addgroupexpense?grpid=${groupId}&grpname=${grpName}&leader=${groupLeader}`}
            className="et-btn et-btn-primary"
          >
            <IconPlus size={15} /> Add expense
          </Link>
        }
      />

      {alert.visible && <div className="et-alert et-alert-error">{alert.message}</div>}

      <Panel title="Group expenses" hint={`${groupExpenses.length} total`}>
        <ResponsiveTable minWidth={700}>
          <thead>
            <tr>
              <th>S No</th>
              <th>Paid By</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              {isGroupLeader && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </ResponsiveTable>
      </Panel>
    </AppShellLayout>
  );
}

export default GrpExpense;
