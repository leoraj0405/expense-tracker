'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { Stack, TextInput, Group, Button } from '@mantine/core';
import AppShellLayout from '@/layouts/AppShellLayout';
import { PageHero } from '@/components/ui/PageHero';
import { Panel } from '@/components/ui/Panel';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { categoryService } from '@/services/categoryService';
import { ApiError } from '@/services/apiClient';

function AddCategory() {
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const router = useRouter();
  useRequireAuth();

  const [formData, setFormData] = useState({ categoryName: '' });
  const [alertBlock, setAlertBlock] = useState({ blockState: true, msg: '' });

  const fetchCategory = useCallback(async (categoryId: string) => {
    try {
      const res = await categoryService.getById(categoryId);
      setFormData({ categoryName: res.item!.name });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Error fetching category.';
      setAlertBlock({ blockState: false, msg });
    }
  }, []);

  useEffect(() => {
    if (id) fetchCategory(id);
  }, [id, fetchCategory]);

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
      router.push('/category');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong.';
      setAlertBlock({ blockState: false, msg });
    }
  };

  return (
    <AppShellLayout>
      <PageHero
        title={id ? 'Edit category' : 'Add category'}
        subtitle="Organize how spending gets grouped."
      />

      {!alertBlock.blockState && <div className="et-alert et-alert-error">{alertBlock.msg}</div>}

      <Panel title="Category details">
        <Stack gap="md" maw={520}>
          <TextInput
            label="Category Name"
            name="categoryName"
            value={formData.categoryName}
            onChange={handleChange}
            placeholder="Enter category name"
          />

          <Group justify="flex-end" mt="md" wrap="wrap">
            <Button component={Link} href="/category" variant="default" className="et-btn et-btn-ghost">
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

export default AddCategory;
