import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Title,
  Group,
  Button,
  Alert,
  Table,
  Text,
  Paper,
  Stack,
  Center,
  Loader,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import CountUp from 'react-countup';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageBreadcrumbs } from '../../components/PageBreadcrumbs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getUserId, getEntityId } from '../../utils/entity';
import { groupExpenseService } from '../../services/groupExpenseService';
import { ApiError } from '../../services/apiClient';
import type { GroupExpense } from '../../types/entities';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function GrpExpense() {
  const location = useLocation();
  const query = useQuery();
  const loginUser = useRequireAuth();

  const groupId = query.get('grpid');
  const grpName = query.get('grpname') || 'Group';
  const groupLeader = query.get('leader');
  const isGroupLeader = groupLeader === getUserId(loginUser);

  const [alert, setAlert] = useState({ visible: false, message: '' });
  const [groupExpenses, setGroupExpenses] = useState<GroupExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <Table.Tr>
      <Table.Td colSpan={isGroupLeader ? 6 : 5}>
        <Center py="xl">
          <Loader />
        </Center>
      </Table.Td>
    </Table.Tr>
  ) : groupExpenses.length === 0 ? (
    <Table.Tr>
      <Table.Td colSpan={isGroupLeader ? 6 : 5}>
        <Text ta="center" c="dimmed" py="lg">
          No expenses found
        </Text>
      </Table.Td>
    </Table.Tr>
  ) : (
    groupExpenses.map((expense, index) => (
      <Table.Tr key={getEntityId(expense) || index}>
        <Table.Td>{index + 1}</Table.Td>
        <Table.Td>{expense.user?.name || 'New user (profile not updated)'}</Table.Td>
        <Table.Td>{expense.description || '-'}</Table.Td>
        <Table.Td>
          <CountUp end={expense.amount} prefix="₹" separator="," />
        </Table.Td>
        <Table.Td>{expense.category?.name || '-'}</Table.Td>
        {isGroupLeader && (
          <Table.Td>
            <Group gap="xs">
              <Button
                component={Link}
                to={`/group/groupexpense/editgroupexpense?grpexpid=${getEntityId(expense)}&grpid=${groupId}&grpname=${grpName}&leader=${groupLeader}`}
                size="xs"
                variant="light"
                color="yellow"
                leftSection={<IconEdit size={14} />}
              >
                Edit
              </Button>
              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => handleDelete(getEntityId(expense))}
              >
                Delete
              </Button>
            </Group>
          </Table.Td>
        )}
      </Table.Tr>
    ))
  );

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>{grpName} — Expenses</Title>
          <PageBreadcrumbs
            items={[
              { label: 'Groups', to: '/group' },
              { label: 'Group Expenses', to: location.pathname + location.search },
            ]}
          />
        </Group>

        {alert.visible && (
          <Alert color="red" variant="light">
            {alert.message}
          </Alert>
        )}

        <Group justify="flex-end">
          <Button
            component={Link}
            to={`/group/groupexpense/addgroupexpense?grpid=${groupId}&grpname=${grpName}&leader=${groupLeader}`}
            leftSection={<IconPlus size={16} />}
          >
            Add Expense
          </Button>
        </Group>

        <Paper shadow="sm" radius="md" withBorder>
          <Table.ScrollContainer minWidth={700}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>S No</Table.Th>
                  <Table.Th>Paid By</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Category</Table.Th>
                  {isGroupLeader && <Table.Th>Actions</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      </Stack>
    </AppShellLayout>
  );
}

export default GrpExpense;
