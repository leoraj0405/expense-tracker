import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  AppShell,
  Group,
  Text,
  Image,
  Avatar,
  Menu,
  UnstyledButton,
  Paper,
  Stack,
  Title,
  Select,
  TextInput,
  Table,
  Center,
  Loader,
  Pagination,
  Alert,
  Grid,
  rem,
} from '@mantine/core';
import { IconLogout, IconChevronDown } from '@tabler/icons-react';
import { userService } from '../services/userService';
import { expenseService } from '../services/expenseService';
import { ApiError } from '../services/apiClient';
import { getCategoryName, getEntityId } from '../utils/entity';
import type { User, Expense } from '../types/entities';
import Logo from '../assets/img/websiteLogo.png';
import defaultImage from '../assets/img/profile.png';

const COLORS = ['#4c6ef5', '#40c057', '#fab005', '#fa5252', '#7950f2'];
const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
};

interface ChartDatum {
  name: string;
  value: number;
}

interface ParentHomeState {
  user: string;
  children: User[];
  childExpense: Expense[];
  currentPage: number;
  totalPages: number;
  amount: number;
  chartData: ChartDatum[];
  date: string;
  isLoading: boolean;
  error: string | null;
  hasSelectedChild: boolean;
}

function ParentHome() {
  const navigate = useNavigate();

  const [state, setState] = useState<ParentHomeState>({
    user: '',
    children: [],
    childExpense: [],
    currentPage: 1,
    totalPages: 1,
    amount: 0,
    chartData: [],
    date: '',
    isLoading: false,
    error: null,
    hasSelectedChild: false,
  });

  const checkParentAuth = useCallback(async () => {
    try {
      const res = await userService.parentHome();
      setState((prev) => ({ ...prev, children: res.items }));
    } catch (err) {
      if (err instanceof ApiError) {
        navigate('/parentlogin');
      } else {
        setState((prev) => ({ ...prev, error: 'Failed to fetch children data' }));
      }
    }
  }, [navigate]);

  useEffect(() => {
    checkParentAuth();
  }, [checkParentAuth]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, date: e.target.value }));
  };

  const handleUserChange = (value: string | null) => {
    setState((prev) => ({
      ...prev,
      user: value || '',
      hasSelectedChild: true,
      currentPage: 1,
    }));
  };

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > state.totalPages) return;
      setState((prev) => ({ ...prev, currentPage: page }));
    },
    [state.totalPages]
  );

  const fetchChildExpenses = useCallback(async () => {
    if (!state.user) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      let formattedDate = state.date;
      if (!formattedDate) {
        const today = new Date();
        formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      }

      const res = await expenseService.listByUser(state.user, {
        page: state.currentPage,
        date: formattedDate,
      });

      const expenses = res.items;
      const meta = res.item!;
      const newTotalPages = Math.ceil(meta.total / meta.limit);
      const newChartData = expenses.map((item) => ({
        name: item.description,
        value: item.amount,
      }));
      const totalAmount = newChartData.reduce((sum, item) => sum + Number(item.value), 0);

      setState((prev) => ({
        ...prev,
        childExpense: expenses,
        totalPages: newTotalPages,
        chartData: newChartData,
        amount: totalAmount,
        isLoading: false,
      }));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch expenses';
      setState((prev) => ({ ...prev, error: msg, isLoading: false }));
    }
  }, [state.user, state.currentPage, state.date]);

  useEffect(() => {
    fetchChildExpenses();
  }, [fetchChildExpenses]);

  const today = new Date();
  const maxMonth = today.toISOString().slice(0, 7);

  const childOptions = state.children.map((child) => ({
    value: getEntityId(child) || '',
    label: child.name,
  }));

  const expenseRows =
    state.childExpense.length > 0 ? (
      state.childExpense.map((item, index) => (
        <Table.Tr key={getEntityId(item) || index}>
          <Table.Td>{(state.currentPage - 1) * 10 + index + 1}</Table.Td>
          <Table.Td>{item.description}</Table.Td>
          <Table.Td>{getCategoryName(item.category)}</Table.Td>
          <Table.Td>₹ {item.amount}</Table.Td>
          <Table.Td>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleString('en-IN', TIME_OPTIONS)
              : '-'}
          </Table.Td>
        </Table.Tr>
      ))
    ) : (
      <Table.Tr>
        <Table.Td colSpan={5}>
          <Text ta="center" c="dimmed" py="lg">
            {state.isLoading ? 'Loading expenses...' : 'No expenses found'}
          </Text>
        </Table.Td>
      </Table.Tr>
    );

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Image src={Logo} alt="Logo" w={32} h={32} radius="md" />
            <Text fw={700} size="lg" c="indigo">
              Expense Tracker
            </Text>
          </Group>

          <Menu shadow="md" width={160} position="bottom-end">
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Text size="sm" visibleFrom="sm" c="dimmed">
                    Welcome Parent
                  </Text>
                  <Avatar src={defaultImage} radius="xl" size={36} />
                  <IconChevronDown style={{ width: rem(14), height: rem(14) }} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                color="red"
                leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                component={Link}
                to="/parentlogin"
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Stack gap="lg">
          {state.error && (
            <Alert
              color="red"
              variant="light"
              onClose={() => setState((prev) => ({ ...prev, error: null }))}
              withCloseButton
            >
              {state.error}
            </Alert>
          )}

          <Paper shadow="sm" p="lg" radius="md" withBorder maw={500}>
            <Title order={4} mb="md">
              Select Child
            </Title>
            <Select
              placeholder="-- Select a child --"
              data={childOptions}
              value={state.user}
              onChange={handleUserChange}
              disabled={state.isLoading}
            />
          </Paper>

          {state.hasSelectedChild && state.user && (
            <>
              <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper shadow="sm" p="lg" radius="md" withBorder h="100%">
                    <Title order={4} ta="center" mb="md">
                      Expenses Breakdown
                    </Title>
                    {state.chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={state.chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                            {state.chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`₹${value}`, 'Amount']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Text ta="center" c="dimmed" py="xl">
                        No chart data
                      </Text>
                    )}
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper shadow="sm" p="xl" radius="md" withBorder h="100%">
                    <Stack align="center" justify="center" h="100%" gap="md">
                      <Title order={4}>Total Expenses</Title>
                      <Text size="xl" fw={700} c="indigo">
                        ₹{state.amount.toLocaleString()}
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>

              <TextInput
                label="Filter by month"
                type="month"
                value={state.date}
                onChange={handleDateChange}
                max={maxMonth}
                disabled={state.isLoading}
                w={{ base: '100%', xs: 250 }}
              />

              <Paper shadow="sm" radius="md" withBorder>
                <Stack gap="md" p="md">
                  <Title order={4}>Expenses</Title>
                  {state.isLoading ? (
                    <Center py="xl">
                      <Loader />
                    </Center>
                  ) : (
                    <>
                      <Table.ScrollContainer minWidth={600}>
                        <Table striped highlightOnHover>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>#</Table.Th>
                              <Table.Th>Description</Table.Th>
                              <Table.Th>Category</Table.Th>
                              <Table.Th>Amount</Table.Th>
                              <Table.Th>Date & Time</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>{expenseRows}</Table.Tbody>
                        </Table>
                      </Table.ScrollContainer>

                      {state.childExpense.length > 0 && (
                        <Center>
                          <Pagination
                            value={state.currentPage}
                            onChange={goToPage}
                            total={state.totalPages}
                            disabled={state.isLoading}
                          />
                        </Center>
                      )}
                    </>
                  )}
                </Stack>
              </Paper>
            </>
          )}

          {state.children.length === 0 && !state.isLoading && (
            <Paper shadow="sm" p="xl" radius="md" withBorder ta="center">
              <Title order={3}>No Children Found</Title>
              <Text c="dimmed" mt="sm">
                You don&apos;t have any children registered yet.
              </Text>
            </Paper>
          )}
        </Stack>

        <Text size="xs" c="dimmed" ta="center" mt="xl">
          Designed by Leo
        </Text>
      </AppShell.Main>
    </AppShell>
  );
}

export default ParentHome;
