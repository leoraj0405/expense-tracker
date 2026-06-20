import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Title,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Center,
  Loader,
  Grid,
  Badge,
} from '@mantine/core';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageBreadcrumbs } from '../../components/PageBreadcrumbs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getUserId, getEntityId } from '../../utils/entity';
import { groupExpenseService } from '../../services/groupExpenseService';
import { groupMemberService } from '../../services/groupMemberService';
import { ApiError } from '../../services/apiClient';
import type { GroupExpense } from '../../types/entities';

const COLORS = ['#ff6384', '#36a2eb', '#4bc0c0', '#9966ff', '#ff9f40'];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

interface ChartDatum {
  name: string;
  value: number;
}

type ExpenseGroupMap = Record<string, Record<string, number>>;

function Settlements() {
  const location = useLocation();
  const query = useQuery();
  const loginUser = useRequireAuth();

  const groupId = query.get('grpid');
  const groupName = query.get('grpname') || 'Group';

  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [chartData, setChartData] = useState<ChartDatum[]>([]);
  const [groupExpenses, setGroupedExpenses] = useState<ExpenseGroupMap>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    try {
      const res = await groupExpenseService.listByGroup(groupId);
      const data = res.items;
      setExpenses(data);
      setChartData(data.map((item) => ({ name: item.description, value: item.amount })));
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
    <Table.Tr>
      <Table.Td colSpan={6}>
        <Center py="xl">
          <Loader />
        </Center>
      </Table.Td>
    </Table.Tr>
  ) : expenses.length === 0 ? (
    <Table.Tr>
      <Table.Td colSpan={6}>
        <Text ta="center" c="dimmed" py="lg">
          No records
        </Text>
      </Table.Td>
    </Table.Tr>
  ) : (
    expenses.map((item, index) => {
      const splitMethod = item.splitAmong ? 'Equal' : 'Unequal';
      return (
        <Table.Tr key={getEntityId(item) || index}>
          <Table.Td>{index + 1}</Table.Td>
          <Table.Td>{item.description}</Table.Td>
          <Table.Td>{item.user?.name || 'User'}</Table.Td>
          <Table.Td>₹{item.amount}</Table.Td>
          <Table.Td>
            <Badge variant="light">{splitMethod}</Badge>
          </Table.Td>
          <Table.Td>
            {item.splitAmong && <Text size="sm">Each member ₹{item.splitAmong[0]?.share}</Text>}
            {item.splitUnequal?.map((shareItem, shareIndex) => (
              <Text key={shareIndex} size="sm">
                {members[shareItem.memberId] || 'User'}: ₹{shareItem.share}
              </Text>
            ))}
          </Table.Td>
        </Table.Tr>
      );
    })
  );

  const SettlementItem = ({ payerId, owes }: { payerId: string; owes: Record<string, number> }) => (
    <Paper key={payerId} p="md" withBorder radius="md" mb="sm">
      <Text fw={600} mb="xs">
        To pay {members[payerId] || 'User'}
      </Text>
      <Stack gap={4}>
        {Object.entries(owes).map(([owedId, amount]) => (
          <Text key={owedId} size="sm">
            {members[owedId] || 'User'}: ₹{amount}
          </Text>
        ))}
      </Stack>
    </Paper>
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
      <Paper key={payerId} p="md" withBorder radius="md" mb="sm" bg="indigo.0">
        <Text fw={600} mb="xs">
          {payerId === loginUserId
            ? 'Others need to pay you'
            : `You need to pay ${members[payerId] || 'User'}`}
        </Text>
        <Stack gap={4}>
          {Object.entries(owes).map(([owedId, amount]) => {
            if (payerId === loginUserId && owedId !== loginUserId) {
              return (
                <Text key={owedId} size="sm">
                  {members[owedId] || 'User'}: ₹{amount}
                </Text>
              );
            }
            if (owedId === loginUserId) {
              return (
                <Text key={owedId} size="sm">
                  {members[payerId] || 'User'}: ₹{amount}
                </Text>
              );
            }
            return null;
          })}
        </Stack>
      </Paper>
    );
  };

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>{groupName} — Settlements</Title>
          <PageBreadcrumbs
            items={[
              { label: 'Groups', to: '/group' },
              { label: 'Settlements', to: location.pathname + location.search },
            ]}
          />
        </Group>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="lg" radius="md" withBorder>
              <Title order={4} ta="center" mb="md">
                {groupName} Expense Summary
              </Title>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Text ta="center" c="dimmed" py="xl">
                  No chart data available
                </Text>
              )}
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="lg" radius="md" withBorder h="100%">
              <Title order={4} ta="center" mb="md">
                Your Settlements
              </Title>
              {Object.keys(groupExpenses).length === 0 ? (
                <Text ta="center" c="dimmed">
                  No settlements for you
                </Text>
              ) : (
                Object.entries(groupExpenses).map(([payerId, owes]) => (
                  <SettlementItemToUser key={payerId} payerId={payerId} owes={owes} />
                ))
              )}
            </Paper>
          </Grid.Col>
        </Grid>

        <Paper shadow="sm" radius="md" withBorder>
          <Stack gap="md" p="md">
            <Title order={4}>{groupName} Expense Details</Title>
            <Table.ScrollContainer minWidth={700}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>S No</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Paid By</Table.Th>
                    <Table.Th>Total Amount</Table.Th>
                    <Table.Th>Split Method</Table.Th>
                    <Table.Th>Shares</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{expenseRows}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Title order={4} ta="center" mb="md">
            Overall Member Settlements
          </Title>
          {Object.keys(groupExpenses).length === 0 ? (
            <Text ta="center" c="dimmed">
              All settled up!
            </Text>
          ) : (
            Object.entries(groupExpenses).map(([payerId, owes]) => (
              <SettlementItem key={payerId} payerId={payerId} owes={owes} />
            ))
          )}
        </Paper>
      </Stack>
    </AppShellLayout>
  );
}

export default Settlements;
