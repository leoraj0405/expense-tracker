'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Stack, TextInput, Group, Button } from '@mantine/core';
import AppShellLayout from '@/layouts/AppShellLayout';
import { PageHero } from '@/components/ui/PageHero';
import { Panel } from '@/components/ui/Panel';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useQueryParams } from '@/hooks/useQueryParams';
import { getUserId, getEntityId } from '@/utils/entity';
import { groupService } from '@/services/groupService';
import { groupMemberService } from '@/services/groupMemberService';
import { ApiError } from '@/services/apiClient';

interface GroupForm {
  grpId: string;
  grpName: string;
}

function AddGroup() {
  const router = useRouter();
  const query = useQueryParams();
  const loginUser = useRequireAuth();

  const groupId = query.get('group');
  const [formData, setFormData] = useState<GroupForm>({ grpId: '', grpName: '' });
  const [alert, setAlert] = useState({ show: false, message: '', type: 'danger' as 'danger' | 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroupData = useCallback(async (id: string) => {
    try {
      const res = await groupService.getById(id);
      const group = res.item!;
      setFormData({ grpId: getEntityId(group) || '', grpName: group.name });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch group data';
      showAlert(msg, 'danger');
    }
  }, []);

  useEffect(() => {
    if (groupId) fetchGroupData(groupId);
  }, [groupId, fetchGroupData]);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 10000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const showAlert = (message: string, type: 'danger' | 'success' = 'danger') => {
    setAlert({ show: true, message, type });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCurrentUserAsMember = useCallback(async (newGroupId: string, email: string) => {
    await groupMemberService.create({ email, groupId: newGroupId });
  }, []);

  const handleSubmit = async () => {
    if (!formData.grpName.trim()) {
      showAlert('Group name is required', 'danger');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    const { grpId, grpName } = formData;
    const createdBy = getUserId(loginUser);
    const email = loginUser?.data?.email || loginUser?.email;

    if (!createdBy || !email) {
      showAlert('User session invalid', 'danger');
      setIsSubmitting(false);
      return;
    }

    try {
      let newGroupId = grpId;

      if (grpId) {
        await groupService.update(grpId, { name: grpName, createdBy });
      } else {
        const res = await groupService.create({ name: grpName, createdBy });
        newGroupId = getEntityId(res.item!) || '';
        await addCurrentUserAsMember(newGroupId, email);
      }

      showAlert(`Group ${grpId ? 'updated' : 'created'} successfully!`, 'success');
      setTimeout(() => router.push('/group'), 1500);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save group';
      showAlert(msg, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShellLayout>
      <PageHero
        title={groupId ? 'Edit group' : 'Create group'}
        subtitle={groupId ? 'Update group details.' : 'Start a new shared expense group.'}
      />

      {alert.show && (
        <div className={`et-alert ${alert.type === 'success' ? 'et-alert-success' : 'et-alert-error'}`}>
          {alert.message}
        </div>
      )}

      <Panel title="Group details">
        <Stack gap="md" maw={520}>
          <TextInput
            label="Group Name"
            name="grpName"
            value={formData.grpName}
            onChange={handleChange}
            placeholder="Enter group name"
            disabled={isSubmitting}
          />

          <Group justify="flex-end" mt="md" wrap="wrap">
            <Button component={Link} href="/group" variant="default" className="et-btn et-btn-ghost" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={isSubmitting} className="et-btn et-btn-primary">
              {groupId ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Panel>
    </AppShellLayout>
  );
}

export default AddGroup;
