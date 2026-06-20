import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { modals } from '@mantine/modals';
import { Center, Loader, Pagination, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import CountUp from 'react-countup';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageHero } from '../../components/ui/PageHero';
import { Panel } from '../../components/ui/Panel';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { ExpenseMonthFilter } from '../../components/ui/ExpenseMonthFilter';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getUserId, getCategoryName, getEntityId } from '../../utils/entity';
import { expenseService } from '../../services/expenseService';
import { ApiError } from '../../services/apiClient';
import {
  formatDisplayDate,
  getCurrentMonthRange,
  resolveInitialDateRange,
} from '../../utils/date';
import type { Expense } from '../../types/entities';

function ListMyExpense() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const loginUser = useRequireAuth();
  const userId = getUserId(loginUser);

  const initialRange = resolveInitialDateRange({
    startDate: queryParams.get('startDate'),
    endDate: queryParams.get('endDate'),
    month: queryParams.get('date'),
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [limit, setLimit] = useState(10);
  const [alert, setAlert] = useState({ success: true, error: false, msg: '' });
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTotalAmount, setPageTotalAmount] = useState(0);

  const syncUrl = useCallback(
    (from: string, to: string) => {
      const params = new URLSearchParams();
      params.set('startDate', from);
      params.set('endDate', to);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    },
    [location.pathname, navigate]
  );

  const applyRange = useCallback(
    (from: string, to: string) => {
      setStartDate(from);
      setEndDate(to);
      setCurrentPage(1);
      syncUrl(from, to);
    },
    [syncUrl]
  );

  useEffect(() => {
    const hasRange =
      queryParams.get('startDate') ||
      queryParams.get('endDate') ||
      queryParams.get('date');
    if (!hasRange) {
      const range = getCurrentMonthRange();
      syncUrl(range.startDate, range.endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExpenses = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const res = await expenseService.listByUser(userId, {
        page: currentPage,
        startDate,
        endDate,
      });
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
  }, [userId, startDate, endDate, currentPage]);

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

  const rows = isLoading ? (
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
        <p className="et-empty-note">No expenses found for this month</p>
      </td>
    </tr>
  ) : (
    expenses.map((item, idx) => (
      <tr key={getEntityId(item) || idx}>
        <td data-label="S No">{(currentPage - 1) * limit + idx + 1}</td>
        <td data-label="Description">{item.description}</td>
        <td data-label="Category">{getCategoryName(item.category)}</td>
        <td data-label="Date">{formatDisplayDate(item.date)}</td>
        <td data-label="Amount" style={{ fontWeight: 700 }}>
          <CountUp end={Number(item.amount)} prefix="₹" separator="," />
        </td>
        <td data-label="Actions" className="et-td-actions">
          <div className="et-actions-wrap">
            <Link
              to={`/editexpense?mode=edit&expense=${getEntityId(item)}`}
              className="et-btn et-btn-ghost et-btn-sm"
            >
              <IconEdit size={14} /> Edit
            </Link>
            <button
              type="button"
              className="et-btn et-btn-ghost et-btn-sm"
              style={{ color: 'var(--et-red)' }}
              onClick={() => handleDelete(getEntityId(item))}
            >
              <IconTrash size={14} /> Delete
            </button>
          </div>
        </td>
      </tr>
    ))
  );

  return (
    <AppShellLayout>
      <PageHero
        title="Expenses"
        subtitle="Every transaction you've logged, in one place."
        action={
          <Link to="/expense/addexpense" className="et-btn et-btn-primary">
            <IconPlus size={15} /> Add expense
          </Link>
        }
      />

      {alert.msg && (
        <div className={`et-alert ${alert.error ? 'et-alert-error' : 'et-alert-success'}`}>
          {alert.msg}
        </div>
      )}

      <div className="et-date-range">
        <ExpenseMonthFilter startDate={startDate} endDate={endDate} onChange={applyRange} />
      </div>

      <Panel
        title="All expenses"
        hint={
          expenses.length > 0
            ? `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)} · Page total: ₹${pageTotalAmount.toLocaleString('en-IN')}`
            : `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`
        }
      >
        <ResponsiveTable minWidth={640}>
          <thead>
            <tr>
              <th>S No</th>
              <th>Description</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </ResponsiveTable>
      </Panel>

      {expenses.length > 0 && (
        <div className="et-pagination-wrap">
          <Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} color="navy" />
        </div>
      )}
    </AppShellLayout>
  );
}

export default ListMyExpense;
