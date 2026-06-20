import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { modals } from '@mantine/modals';
import { Center, Loader, Pagination, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageHero } from '../../components/ui/PageHero';
import { Panel } from '../../components/ui/Panel';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getEntityId } from '../../utils/entity';
import { categoryService } from '../../services/categoryService';
import { ApiError } from '../../services/apiClient';
import type { Category } from '../../types/entities';

function CategoryList() {
  useRequireAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'danger' as 'danger' | 'success' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 10000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.list(pagination.currentPage);
      setCategories(res.items);
      const meta = res.item!;
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.ceil(meta.total / meta.limit),
      }));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch categories';
      setAlert({
        show: true,
        message: msg,
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = useCallback(
    (id: string | null) => {
      if (!id) return;

      modals.openConfirmModal({
        title: 'Delete category',
        children: <Text size="sm">Are you sure you want to delete this category?</Text>,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
          try {
            await categoryService.delete(id);
            setAlert({ show: true, message: 'Category deleted successfully', type: 'success' });
            fetchCategories();
          } catch (err) {
            const msg = err instanceof ApiError ? err.message : 'Failed to delete category';
            setAlert({
              show: true,
              message: msg,
              type: 'danger',
            });
          }
        },
      });
    },
    [fetchCategories]
  );

  const rows = isLoading ? (
    <tr className="et-tr-full">
      <td colSpan={3}>
        <Center py="xl">
          <Loader color="navy" />
        </Center>
      </td>
    </tr>
  ) : categories.length === 0 ? (
    <tr className="et-tr-full">
      <td colSpan={3}>
        <p className="et-empty-note">No categories found</p>
      </td>
    </tr>
  ) : (
    categories.map((category, index) => (
      <tr key={getEntityId(category) || index}>
        <td data-label="#">{index + 1}</td>
        <td data-label="Category Name" style={{ fontWeight: 600 }}>
          {category.name}
        </td>
        <td data-label="Actions" className="et-td-actions">
          <div className="et-actions-wrap">
            <Link
              to={`editcategory/${getEntityId(category)}`}
              className="et-btn et-btn-ghost et-btn-sm"
            >
              <IconEdit size={14} /> Edit
            </Link>
            <button
              type="button"
              className="et-btn et-btn-ghost et-btn-sm"
              style={{ color: 'var(--et-red)' }}
              onClick={() => handleDelete(getEntityId(category))}
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
        title="Categories"
        subtitle="Organize how spending gets grouped."
        action={
          <Link to="addcategory" className="et-btn et-btn-primary">
            <IconPlus size={15} /> Add category
          </Link>
        }
      />

      {alert.show && (
        <div
          className={`et-alert ${alert.type === 'success' ? 'et-alert-success' : 'et-alert-error'}`}
        >
          {alert.message}
        </div>
      )}

      <Panel title="All categories" hint={`${categories.length} total`}>
        <ResponsiveTable minWidth={400}>
          <thead>
            <tr>
              <th>#</th>
              <th>Category Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </ResponsiveTable>
      </Panel>

      {categories.length > 0 && (
        <div className="et-pagination-wrap">
          <Pagination
            value={pagination.currentPage}
            onChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
            total={pagination.totalPages}
            color="navy"
          />
        </div>
      )}
    </AppShellLayout>
  );
}

export default CategoryList;
