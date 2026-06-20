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
  Pagination,
  TextInput,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import CountUp from 'react-countup';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageBreadcrumbs } from '../../components/PageBreadcrumbs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getUserId, getCategoryName, getEntityId } from '../../utils/entity';
import { expenseService } from '../../services/expenseService';
import { ApiError } from '../../services/apiClient';
import type { Expense } from '../../types/entities';

function ListMyExpense() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryDate = queryParams.get('date');

  const loginUser = useRequireAuth();
  const userId = getUserId(loginUser);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [limit, setLimit] = useState(10);
  const [alert, setAlert] = useState({ success: true, error: false, msg: '' });
  const [date, setDate] = useState(queryDate || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTotalAmount, setPageTotalAmount] = useState(0);

  useEffect(() => {
    if (queryDate) setDate(queryDate);
  }, [queryDate]);

  const fetchExpenses = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const res = await expenseService.listByUser(userId, { page: currentPage, date: date || undefined });
      setExpenses(res.items);
      const meta = res.item!;
      setLimit(meta.limit);
      setTotalPages(Math.ceil(meta.total / meta.limit));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch expenses';
      setAlert({ success: false, error: true, msg });
      setExpenses([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [userId, date, currentPage]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    if (!alert.msg) return;
    const timer = setTimeout(() => setAlert({ success: true, error: false, msg: '' }), 5000);
    return () => clearTimeout(timer);
  }, [alert]);

  const handleDelete = (id: string | null) => {
    if (!id) return;

    modals.openConfirmModal({
      title: 'Delete expense',
      children: <Text size="sm">Are you sure you want to delete this record?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await expenseService.delete(id);
          fetchExpenses();
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Failed to delete expense';
          setAlert({ success: false, error: true, msg });
        }
      },
    });
  };

  useEffect(() => {
    const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    setPageTotalAmount(total || 0);
  }, [expenses]);

  const today = new Date();
  const maxMonth = today.toISOString().slice(0, 7);

  const rows = isLoading ? (
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
          No expenses found
        </Text>
      </Table.Td>
    </Table.Tr>
  ) : (
    expenses.map((item, idx) => (
      <Table.Tr key={getEntityId(item) || idx}>
        <Table.Td>{(currentPage - 1) * limit + idx + 1}</Table.Td>
        <Table.Td>{item.description}</Table.Td>
        <Table.Td>{getCategoryName(item.category)}</Table.Td>
        <Table.Td>{item.date?.split('T')[0]}</Table.Td>
        <Table.Td>
          <CountUp end={Number(item.amount)} prefix="₹" separator="," />
        </Table.Td>
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            <Button
              component={Link}
              to={`/editexpense?mode=edit&expense=${getEntityId(item)}`}
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
              onClick={() => handleDelete(getEntityId(item))}
            >
              Delete
            </Button>
          </Group>
        </Table.Td>
      </Table.Tr>
    ))
  );

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>My Expenses</Title>
          <PageBreadcrumbs items={[{ label: 'Expenses', to: '/expense' }]} />
        </Group>

        {alert.msg && (
          <Alert color={alert.error ? 'red' : 'green'} variant="light">
            {alert.msg}
          </Alert>
        )}

        <Group justify="space-between" align="flex-end" wrap="wrap">
          <TextInput
            label="Filter by month"
            type="month"
            value={date}
            max={maxMonth}
            onChange={(e) => setDate(e.target.value)}
            w={{ base: '100%', xs: 200 }}
          />
          <Button component={Link} to="/expense/addexpense" leftSection={<IconPlus size={16} />}>
            Add New Expense
          </Button>
        </Group>

        <Paper shadow="sm" radius="md" withBorder>
          <Table.ScrollContainer minWidth={600}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>S No</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>
                    <Stack gap={0}>
                      <Text size="sm">Amount</Text>
                      <Text size="xs" c="dimmed">
                        Total: <CountUp end={pageTotalAmount} prefix="₹" separator="," />
                      </Text>
                    </Stack>
                  </Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>

        {expenses.length > 0 && (
          <Center>
            <Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} />
          </Center>
        )}
      </Stack>
    </AppShellLayout>
  );
}

export default ListMyExpense;
