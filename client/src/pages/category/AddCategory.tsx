import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  Title,
  Group,
  Button,
  Alert,
  Paper,
  Stack,
  TextInput,
} from '@mantine/core';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageBreadcrumbs } from '../../components/PageBreadcrumbs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { categoryService } from '../../services/categoryService';
import { ApiError } from '../../services/apiClient';

function AddCategory() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  useRequireAuth();

  const [formData, setFormData] = useState({ categoryName: '' });
  const [alertBlock, setAlertBlock] = useState({ blockState: true, msg: '' });

  useEffect(() => {
    if (id) fetchCategory(id);
  }, [id]);

  const fetchCategory = async (categoryId: string) => {
    try {
      const res = await categoryService.getById(categoryId);
      setFormData({ categoryName: res.item!.name });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Error fetching category.';
      setAlertBlock({ blockState: false, msg });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (id) {
        await categoryService.update(id, { name: formData.categoryName });
      } else {
        await categoryService.create({ name: formData.categoryName });
      }
      navigate('/category');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong.';
      setAlertBlock({ blockState: false, msg });
    }
  };

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>{id ? 'Edit Category' : 'Add Category'}</Title>
          <PageBreadcrumbs
            items={[
              { label: 'Categories', to: '/category' },
              { label: id ? 'Edit Category' : 'Add Category', to: '#' },
            ]}
          />
        </Group>

        {!alertBlock.blockState && (
          <Alert color="red" variant="light">
            {alertBlock.msg}
          </Alert>
        )}

        <Paper shadow="sm" p="xl" radius="md" withBorder maw={500}>
          <Stack gap="md">
            <TextInput
              label="Category Name"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              placeholder="Enter category name"
            />

            <Group justify="flex-end" mt="md">
              <Button component={Link} to="/category" variant="light" color="gray">
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

export default AddCategory;
