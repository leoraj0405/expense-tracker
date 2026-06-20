import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Title,
  Text,
  Paper,
  Grid,
  Stack,
  Button,
  Alert,
  Center,
  Loader,
  Group,
  ThemeIcon,
} from '@mantine/core';
import { IconReceipt, IconChartPie } from '@tabler/icons-react';
import CountUp from 'react-countup';
import AppShellLayout from '../layouts/AppShellLayout';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { getUserId } from '../utils/entity';
import { expenseService } from '../services/expenseService';
import { ApiError } from '../services/apiClient';

const COLORS = ['#4c6ef5', '#40c057', '#fab005', '#fa5252', '#7950f2'];

interface ChartDatum {
  name: string;
  value: number;
}

function Dashboard() {
  const loginUser = useRequireAuth();

  const [expenseData, setExpenseData] = useState<ChartDatum[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const userId = getUserId(loginUser);
  const userName = loginUser?.name || loginUser?.data?.name || 'Buddy';

  const fetchThisMonthExpenses = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    try {
      const res = await expenseService.listByUser(userId, { date: formattedDate });
      const chartData = res.items.map(({ description, amount }) => ({
        name: description || 'Uncategorized',
        value: Number(amount),
      }));

      setExpenseData(chartData);
      setError(null);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch expense data';
      setError(msg);
      setExpenseData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchThisMonthExpenses();
  }, [userId, fetchThisMonthExpenses]);

  useEffect(() => {
    setTotalAmount(expenseData.reduce((sum, item) => sum + item.value, 0));
  }, [expenseData]);

  const renderPieChart = () => {
    if (error) return <Alert color="red">{error}</Alert>;
    if (isLoading) {
      return (
        <Center h={280}>
          <Loader />
        </Center>
      );
    }
    if (expenseData.length === 0) {
      return (
        <Alert color="blue" variant="light">
          No expense data available for this month
        </Alert>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            fill="#4c6ef5"
            dataKey="value"
            label={({ name, percent }: { name: string; percent: number }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {expenseData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`₹${value}`, 'Amount']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <div>
          <Title order={2}>Welcome, {userName}!</Title>
          <Text c="dimmed" mt={4}>
            Track your spending. Control your future.
          </Text>
        </div>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="xl" radius="md" withBorder h="100%">
              <Stack align="center" gap="md" h="100%" justify="center">
                <ThemeIcon size={48} radius="md" variant="light" color="indigo">
                  <IconReceipt size={28} />
                </ThemeIcon>
                <Text fw={600} size="lg">
                  Month Total Expenses
                </Text>
                <Text size="xl" fw={700} c="indigo">
                  <CountUp end={totalAmount} prefix="₹" />
                </Text>
                <Button
                  component={Link}
                  to={`/expense?date=${currentYearMonth}`}
                  mt="auto"
                  fullWidth
                >
                  See This Month&apos;s Expenses
                </Button>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="lg" radius="md" withBorder h="100%">
              <Group gap="xs" mb="md" justify="center">
                <ThemeIcon size={32} radius="md" variant="light" color="teal">
                  <IconChartPie size={18} />
                </ThemeIcon>
                <Text fw={600} size="lg">
                  This Month Expenses Chart
                </Text>
              </Group>
              {renderPieChart()}
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </AppShellLayout>
  );
}

export default Dashboard;
