'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Group,
  Button,
  Stack,
  TextInput,
  Textarea,
  Select,
  Radio,
  Collapse,
  Text,
  Divider,
} from '@mantine/core';
import AppShellLayout from '@/layouts/AppShellLayout';
import { PageHero } from '@/components/ui/PageHero';
import { Panel } from '@/components/ui/Panel';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useQueryParams } from '@/hooks/useQueryParams';
import { getEntityId } from '@/utils/entity';
import { groupMemberService } from '@/services/groupMemberService';
import { categoryService } from '@/services/categoryService';
import { groupExpenseService } from '@/services/groupExpenseService';
import { ApiError } from '@/services/apiClient';
import type { Category, GroupMember, ExpenseSplit } from '@/types/entities';

interface GrpExpenseForm {
  id: string;
  groupId: string;
  userId: string;
  description: string;
  amount: string;
  categoryId: string;
}

function AddGrpExpense() {
  useRequireAuth();
  const router = useRouter();
  const query = useQueryParams();

  const grpExpenseId = query.get('grpexpid');
  const grpId = query.get('grpid') || '';
  const grpName = query.get('grpname');
  const groupLeader = query.get('leader');

  const [form, setForm] = useState<GrpExpenseForm>({
    id: '',
    groupId: grpId,
    userId: '',
    description: '',
    amount: '',
    categoryId: '',
  });

  const [users, setUsers] = useState<GroupMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [splitMethod, setSplitMethod] = useState('equal');
  const [unequalShares, setUnequalShares] = useState<ExpenseSplit[]>([]);
  const [alert, setAlert] = useState({ show: true, message: '' });

  const showSplitOptions = form.amount !== '';

  useEffect(() => {
    fetchGroupMembers();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (grpExpenseId) fetchExpenseDetails(grpExpenseId);
  }, [grpExpenseId]);

  async function fetchGroupMembers() {
    try {
      const res = await groupMemberService.listByGroup(grpId);
      setUsers(res.items);
      const membersMap = res.items.reduce<Record<string, string>>((acc, member) => {
        const memberUserId = getEntityId(member.user);
        if (memberUserId) {
          acc[memberUserId] = member.user?.name || '';
        }
        return acc;
      }, {});
      setMembers(membersMap);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load members';
      setAlert({ show: false, message: msg });
    }
  }

  async function fetchCategories() {
    try {
      const res = await categoryService.list();
      setCategories(res.items);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load categories';
      setAlert({ show: false, message: msg });
    }
  }

  async function fetchExpenseDetails(id: string) {
    try {
      const res = await groupExpenseService.getById(id);
      const expense = res.item!;

      setForm({
        id: getEntityId(expense) || '',
        groupId: getEntityId(expense.group) || grpId,
        userId: getEntityId(expense.user) || '',
        categoryId: getEntityId(expense.category) || '',
        description: expense.description,
        amount: String(expense.amount),
      });

      if (expense.splitUnequal?.length) {
        setSplitMethod('unequal');
        setUnequalShares(expense.splitUnequal);
      } else {
        setSplitMethod('equal');
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load expense';
      setAlert({ show: false, message: msg });
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleShareChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedShares = [...unequalShares];
    updatedShares[index] = {
      memberId: getEntityId(users[index]?.user) || '',
      share: Math.max(0, Number(e.target.value)),
    };
    setUnequalShares(updatedShares);
  };

  const handleSubmit = async () => {
    try {
      if (Number(form.amount) <= 0) {
        setAlert({ show: false, message: 'Enter valid amount' });
        return;
      }
      if (splitMethod === 'unequal') {
        const totalShares = unequalShares.reduce((sum, item) => sum + Number(item.share || 0), 0);
        if (Number(form.amount) !== totalShares) {
          setAlert({ show: false, message: 'Users share amount must equal the expense amount' });
          return;
        }
      }

      const payload = {
        groupId: form.groupId,
        userId: form.userId,
        categoryId: form.categoryId,
        description: form.description,
        amount: Math.max(0, Number(form.amount)),
        usersAndShares: splitMethod === 'equal' ? null : unequalShares,
        splitMethod,
      };

      if (form.id) {
        await groupExpenseService.update(form.id, payload);
      } else {
        await groupExpenseService.create(payload);
      }

      router.push(`/group/groupexpense?grpid=${grpId}&grpname=${grpName}&leader=${groupLeader}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save expense';
      setAlert({ show: false, message: msg });
    }
  };

  const memberOptions = users.map((item) => ({
    value: getEntityId(item.user) || '',
    label: item.user?.name || `New user (${item.user?.email})`,
  }));

  const categoryOptions = categories.map((category) => ({
    value: getEntityId(category) || '',
    label: category.name,
  }));

  const equalShare = users.length ? Math.round(Number(form.amount) / users.length) : 0;

  return (
    <AppShellLayout>
      <PageHero
        title={`${grpExpenseId ? 'Edit' : 'Add'} group expense`}
        subtitle={`Log a shared expense for ${grpName}.`}
      />

      {alert.show && alert.message && (
        <div className="et-alert et-alert-error">{alert.message}</div>
      )}

      <div className="et-content-grid">
        <Panel title="Expense details">
          <Stack gap="md">
            <Text style={{ color: 'var(--et-ink-soft)' }} fw={500}>
              Group: {grpName}
            </Text>

            <Select
              label="Paid By"
              placeholder="Select member"
              data={memberOptions}
              value={form.userId}
              onChange={(value) => setForm((prev) => ({ ...prev, userId: value || '' }))}
            />

            <Select
              label="Category"
              placeholder="Select category"
              data={categoryOptions}
              value={form.categoryId}
              onChange={(value) => setForm((prev) => ({ ...prev, categoryId: value || '' }))}
            />

            <TextInput
              label="Amount"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleInputChange}
            />

            {showSplitOptions && (
              <>
                <Radio.Group label="Split method" value={splitMethod} onChange={setSplitMethod}>
                  <Group mt="xs" wrap="wrap">
                    <Radio value="equal" label="Equal" />
                    <Radio value="unequal" label="Unequal" />
                  </Group>
                </Radio.Group>

                <Collapse in={splitMethod === 'unequal'}>
                  <Stack gap="sm" mt="sm">
                    {users.map((user, index) => (
                      <Group
                        key={getEntityId(user.user) || index}
                        justify="space-between"
                        wrap="wrap"
                        className="et-split-row"
                      >
                        <Text size="sm" style={{ flex: 1, minWidth: 120 }}>
                          {members[getEntityId(user.user) || ''] ||
                            `New user (${user.user?.email})`}
                        </Text>
                        <TextInput
                          type="number"
                          value={unequalShares[index]?.share || ''}
                          onChange={(e) => handleShareChange(e, index)}
                          style={{ flex: '0 1 140px', minWidth: 100 }}
                          min={0}
                        />
                      </Group>
                    ))}
                  </Stack>
                </Collapse>
              </>
            )}

            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              minRows={2}
            />

            <Group justify="flex-end" wrap="wrap">
              <Button
                component={Link}
                href={`/group/groupexpense?grpid=${grpId}&grpname=${grpName}&leader=${groupLeader}`}
                variant="default"
                className="et-btn et-btn-ghost"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="et-btn et-btn-primary">
                Submit
              </Button>
            </Group>
          </Stack>
        </Panel>

        {showSplitOptions && splitMethod === 'equal' && (
          <Panel title="Equal shares">
            <Stack gap="sm">
              {users.map((user) => (
                <Group
                  key={getEntityId(user.user) || user.groupId}
                  justify="space-between"
                  wrap="nowrap"
                >
                  <Text size="sm" style={{ minWidth: 0 }}>
                    {members[getEntityId(user.user) || ''] ||
                      `New user (${user.user?.email})`}
                  </Text>
                  <Text fw={600}>₹{equalShare}</Text>
                </Group>
              ))}
              <Divider />
              <Group justify="space-between">
                <Text fw={500}>Total</Text>
                <Text fw={700}>₹{form.amount}</Text>
              </Group>
            </Stack>
          </Panel>
        )}
      </div>
    </AppShellLayout>
  );
}

export default AddGrpExpense;
