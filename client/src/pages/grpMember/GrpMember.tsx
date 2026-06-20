import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageBreadcrumbs } from '../../components/PageBreadcrumbs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getUserId, getEntityId } from '../../utils/entity';
import { groupMemberService } from '../../services/groupMemberService';
import { ApiError } from '../../services/apiClient';
import type { GroupMember } from '../../types/entities';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function GrpMember() {
  const location = useLocation();
  const queryParams = useQuery();
  const loginUser = useRequireAuth();

  const [alert, setAlert] = useState({ show: false, message: '' });
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const groupId = queryParams.get('grpid');
  const groupName = queryParams.get('grpname') || 'Group';
  const groupLeader = queryParams.get('leader');
  const isGroupLeader = groupLeader === getUserId(loginUser);

  const fetchGroupMembers = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    try {
      const res = await groupMemberService.listByGroup(groupId);
      setGroupMembers(res.items);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch group members';
      setAlert({ show: true, message: msg });
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) fetchGroupMembers();
  }, [groupId, fetchGroupMembers]);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const handleDeleteMember = (memberId: string | null) => {
    if (!memberId) return;

    modals.openConfirmModal({
      title: 'Remove member',
      children: <Text size="sm">Are you sure you want to remove this member?</Text>,
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await groupMemberService.delete(memberId);
          fetchGroupMembers();
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Failed to delete member';
          setAlert({ show: true, message: msg });
        }
      },
    });
  };

  const rows = isLoading ? (
    <Table.Tr>
      <Table.Td colSpan={isGroupLeader ? 3 : 2}>
        <Center py="xl">
          <Loader />
        </Center>
      </Table.Td>
    </Table.Tr>
  ) : groupMembers.length === 0 ? (
    <Table.Tr>
      <Table.Td colSpan={isGroupLeader ? 3 : 2}>
        <Text ta="center" c="dimmed" py="lg">
          No members found
        </Text>
      </Table.Td>
    </Table.Tr>
  ) : (
    groupMembers.map((member, index) => (
      <Table.Tr key={getEntityId(member) || index}>
        <Table.Td>{index + 1}</Table.Td>
        <Table.Td>{member.user?.name || `New user (${member.user?.email})`}</Table.Td>
        {isGroupLeader && (
          <Table.Td>
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => handleDeleteMember(getEntityId(member))}
            >
              Remove
            </Button>
          </Table.Td>
        )}
      </Table.Tr>
    ))
  );

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>{groupName} — Members</Title>
          <PageBreadcrumbs
            items={[
              { label: 'Groups', to: '/group' },
              { label: 'Group Members', to: location.pathname + location.search },
            ]}
          />
        </Group>

        {alert.show && (
          <Alert color="red" variant="light">
            {alert.message}
          </Alert>
        )}

        <Group justify="flex-end">
          <Button
            component={Link}
            to={{
              pathname: 'addgroupmember',
              search: `?grpid=${groupId}&grpname=${groupName}&leader=${groupLeader}`,
            }}
            leftSection={<IconPlus size={16} />}
          >
            Add Members
          </Button>
        </Group>

        <Paper shadow="sm" radius="md" withBorder>
          <Table.ScrollContainer minWidth={400}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Member</Table.Th>
                  {isGroupLeader && <Table.Th>Actions</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      </Stack>
    </AppShellLayout>
  );
}

export default GrpMember;
