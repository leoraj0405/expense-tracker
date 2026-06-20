import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Title,
  Group,
  Button,
  Alert,
  Paper,
  Stack,
  TextInput,
  Text,
} from '@mantine/core';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageBreadcrumbs } from '../../components/PageBreadcrumbs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { groupMemberService } from '../../services/groupMemberService';
import { ApiError } from '../../services/apiClient';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

interface MemberForm {
  groupId: string;
  email: string;
}

function AddGrpMember() {
  useRequireAuth();
  const navigate = useNavigate();
  const queryParams = useQuery();

  const groupId = queryParams.get('grpid');
  const groupName = queryParams.get('grpname');
  const groupLeader = queryParams.get('leader');

  const [form, setForm] = useState<MemberForm>({
    groupId: groupId || '',
    email: '',
  });
  const [alert, setAlert] = useState({ show: false, message: '' });

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 10000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(async () => {
    try {
      await groupMemberService.create({ groupId: form.groupId, email: form.email });
      navigate(`/group/groupmember?grpid=${groupId}&grpname=${groupName}&leader=${groupLeader}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to add group member';
      setAlert({ show: true, message: msg });
    }
  }, [form, groupId, groupName, groupLeader, navigate]);

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>Add Group Member</Title>
          <PageBreadcrumbs
            items={[
              { label: 'Groups', to: '/group' },
              {
                label: 'Group Members',
                to: `/group/groupmember?grpid=${groupId}&grpname=${groupName}&leader=${groupLeader}`,
              },
              { label: 'Add Member', to: '#' },
            ]}
          />
        </Group>

        {alert.show && (
          <Alert color="red" variant="light">
            {alert.message}
          </Alert>
        )}

        <Paper shadow="sm" p="xl" radius="md" withBorder maw={500}>
          <Stack gap="md">
            <Text c="dimmed" fw={500}>
              Group: {groupName}
            </Text>

            <TextInput
              label="Member Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter member's email address"
              required
            />

            <Group justify="flex-end" mt="md">
              <Button
                component={Link}
                to={`/group/groupmember?grpid=${groupId}&grpname=${groupName}&leader=${groupLeader}`}
                variant="light"
                color="gray"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!form.email}>
                Add Member
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </AppShellLayout>
  );
}

export default AddGrpMember;
