import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageBreadcrumbs } from '../../components/PageBreadcrumbs';
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
    <Table.Tr>
      <Table.Td colSpan={3}>
        <Center py="xl">
          <Loader />
        </Center>
      </Table.Td>
    </Table.Tr>
  ) : categories.length === 0 ? (
    <Table.Tr>
      <Table.Td colSpan={3}>
        <Text ta="center" c="dimmed" py="lg">
          No categories found
        </Text>
      </Table.Td>
    </Table.Tr>
  ) : (
    categories.map((category, index) => (
      <Table.Tr key={getEntityId(category) || index}>
        <Table.Td>{index + 1}</Table.Td>
        <Table.Td>{category.name}</Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Button
              component={Link}
              to={`editcategory/${getEntityId(category)}`}
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
              onClick={() => handleDelete(getEntityId(category))}
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
          <Title order={2}>Categories</Title>
          <PageBreadcrumbs items={[{ label: 'Categories', to: '/category' }]} />
        </Group>

        <Group justify="flex-end">
          <Button component={Link} to="addcategory" leftSection={<IconPlus size={16} />}>
            Add Category
          </Button>
        </Group>

        {alert.show && (
          <Alert color={alert.type === 'success' ? 'green' : 'red'} variant="light">
            {alert.message}
          </Alert>
        )}

        <Paper shadow="sm" radius="md" withBorder>
          <Table.ScrollContainer minWidth={400}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Category Name</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>

        {categories.length > 0 && (
          <Center>
            <Pagination
              value={pagination.currentPage}
              onChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
              total={pagination.totalPages}
            />
          </Center>
        )}
      </Stack>
    </AppShellLayout>
  );
}

export default CategoryList;
