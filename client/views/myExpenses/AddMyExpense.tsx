'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Group,
  Button,
  Stack,
  TextInput,
  Textarea,
  Select,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import AppShellLayout from '@/layouts/AppShellLayout';
import { PageHero } from '@/components/ui/PageHero';
import { Panel } from '@/components/ui/Panel';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useQueryParams } from '@/hooks/useQueryParams';
import { getUserId, getCategoryId, getEntityId } from '@/utils/entity';
import { toInputDate, parseLocalDate } from '@/utils/date';
import { categoryService } from '@/services/categoryService';
import { expenseService } from '@/services/expenseService';
import { ApiError } from '@/services/apiClient';
import type { Category } from '@/types/entities';

interface ExpenseForm {
  id: string;
  category: string;
  date: string;
  amount: number;
  description: string;
}

function AddMyExpense() {
  const loginUser = useRequireAuth();
  const router = useRouter();
  const query = useQueryParams();
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
          date: toInputDate(expense.date),
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
      router.push('/expense');
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
      <PageHero
        title={isEdit ? 'Edit expense' : 'Add expense'}
        subtitle={isEdit ? 'Update an existing transaction.' : 'Log a new personal expense.'}
      />

      {alert.visible && <div className="et-alert et-alert-error">{alert.msg}</div>}

      <Panel title="Expense details">
        <Stack gap="md" maw={640}>
          <Select
            label="Category"
            name="category"
            placeholder="Choose category"
            data={categoryOptions}
            value={formData.category}
            onChange={(value) => setFormData((prev) => ({ ...prev, category: value || '' }))}
            required
          />

          <div className="et-form-grid">
            <TextInput
              label="Amount"
              type="number"
              name="amount"
              min={0}
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <DatePickerInput
              label="Date"
              value={formData.date ? parseLocalDate(formData.date) : null}
              onChange={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  date: date ? toInputDate(date) : '',
                }))
              }
              maxDate={new Date()}
              leftSection={<IconCalendar size={16} stroke={1.75} />}
              required
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            minRows={3}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button component={Link} href="/expense" variant="default" className="et-btn et-btn-ghost">
              Cancel
            </Button>
            <Button onClick={handleSave} className="et-btn et-btn-primary">
              Submit
            </Button>
          </Group>
        </Stack>
      </Panel>
    </AppShellLayout>
  );
}

export default AddMyExpense;
