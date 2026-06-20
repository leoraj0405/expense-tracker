import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { getUserId, getEntityId } from '../../utils/entity';
import { groupService } from '../../services/groupService';
import { groupMemberService } from '../../services/groupMemberService';
import { ApiError } from '../../services/apiClient';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

interface GroupForm {
  grpId: string;
  grpName: string;
}

function AddGroup() {
  const navigate = useNavigate();
  const query = useQuery();
  const loginUser = useRequireAuth();

  const groupId = query.get('group');
  const [formData, setFormData] = useState<GroupForm>({ grpId: '', grpName: '' });
  const [alert, setAlert] = useState({ show: false, message: '', type: 'danger' as 'danger' | 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (groupId) fetchGroupData(groupId);
  }, [groupId]);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 10000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

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
      setTimeout(() => navigate('/group'), 1500);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save group';
      showAlert(msg, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>{groupId ? 'Edit Group' : 'Create Group'}</Title>
          <PageBreadcrumbs
            items={[
              { label: 'Groups', to: '/group' },
              { label: groupId ? 'Edit Group' : 'Add Group', to: '#' },
            ]}
          />
        </Group>

        {alert.show && (
          <Alert color={alert.type === 'success' ? 'green' : 'red'} variant="light">
            {alert.message}
          </Alert>
        )}

        <Paper shadow="sm" p="xl" radius="md" withBorder maw={500}>
          <Stack gap="md">
            <TextInput
              label="Group Name"
              name="grpName"
              value={formData.grpName}
              onChange={handleChange}
              placeholder="Enter group name"
              disabled={isSubmitting}
            />

            <Group justify="flex-end" mt="md">
              <Button component={Link} to="/group" variant="light" color="gray" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={isSubmitting}>
                {groupId ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </AppShellLayout>
  );
}

export default AddGroup;
