import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Title,
  Group,
  Button,
  Alert,
  Paper,
  Stack,
  TextInput,
  Textarea,
  Select,
  Grid,
} from '@mantine/core';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageBreadcrumbs } from '../../components/PageBreadcrumbs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getUserId, getCategoryId, getEntityId } from '../../utils/entity';
import { categoryService } from '../../services/categoryService';
import { expenseService } from '../../services/expenseService';
import { ApiError } from '../../services/apiClient';
import type { Category } from '../../types/entities';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

interface ExpenseForm {
  id: string;
  category: string;
  date: string;
  amount: number;
  description: string;
}

function AddMyExpense() {
  const loginUser = useRequireAuth();
  const navigate = useNavigate();
  const query = useQuery();
  const expenseId = query.get('expense');
  const isEdit = !!expenseId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ExpenseForm>({
    id: '',
    category: '',
    date: '',
    amount: 0,
    description: '',
  });
  const [alert, setAlert] = useState({ visible: false, msg: '' });

  const today = new Date().toISOString().split('T')[0];

  const showAlert = (msg: string) => setAlert({ visible: true, msg });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.list();
        setCategories(res.items);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Failed to load categories';
        showAlert(msg);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!expenseId) return;

    const fetchExpense = async () => {
      try {
        const res = await expenseService.getById(expenseId);
        const expense = res.item!;

        setFormData({
          id: getEntityId(expense) || '',
          category: getCategoryId(expense.category),
          date: expense.date.split('T')[0],
          amount: expense.amount,
          description: expense.description,
        });
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Failed to load expense';
        showAlert(msg);
      }
    };

    fetchExpense();
  }, [expenseId]);

  useEffect(() => {
    if (!alert.visible) return;
    const timer = setTimeout(() => setAlert({ visible: false, msg: '' }), 5000);
    return () => clearTimeout(timer);
  }, [alert]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const { id, category, amount, date, description } = formData;
    const userId = getUserId(loginUser);

    if (!userId) return;
    if (Number(amount) <= 0) return showAlert('Enter valid amount');

    const payload = {
      description,
      amount: Number(amount),
      userId,
      categoryId: category,
      date,
    };

    try {
      if (id) {
        await expenseService.update(id, payload);
      } else {
        await expenseService.create(payload);
      }
      navigate('/expense');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save expense';
      showAlert(msg);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: getEntityId(cat) || '',
    label: cat.name,
  }));

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>{isEdit ? 'Edit Expense' : 'Add Expense'}</Title>
          <PageBreadcrumbs
            items={[
              { label: 'Expenses', to: '/expense' },
              { label: isEdit ? 'Edit Expense' : 'Add Expense', to: '#' },
            ]}
          />
        </Group>

        {alert.visible && (
          <Alert color="red" variant="light">
            {alert.msg}
          </Alert>
        )}

        <Paper shadow="sm" p="xl" radius="md" withBorder maw={700}>
          <Stack gap="md">
            <Select
              label="Category"
              name="category"
              placeholder="Choose category"
              data={categoryOptions}
              value={formData.category}
              onChange={(value) => setFormData((prev) => ({ ...prev, category: value || '' }))}
              required
            />

            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Amount"
                  type="number"
                  name="amount"
                  min={0}
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Date"
                  type="date"
                  name="date"
                  max={today}
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              minRows={3}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button component={Link} to="/expense" variant="light" color="gray">
                Cancel
              </Button>
              <Button onClick={handleSave}>Submit</Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </AppShellLayout>
  );
}

export default AddMyExpense;
