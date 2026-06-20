import { useEffect, useState } from 'react';
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
  Menu,
  ActionIcon,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus, IconDots } from '@tabler/icons-react';
import CountUp from 'react-countup';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageBreadcrumbs } from '../../components/PageBreadcrumbs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getUserId, getEntityId } from '../../utils/entity';
import { groupService } from '../../services/groupService';
import { groupExpenseService } from '../../services/groupExpenseService';
import { ApiError } from '../../services/apiClient';
import type { Group as GroupEntity } from '../../types/entities';

function GroupList() {
  const loginUser = useRequireAuth();

  const [userGroups, setUserGroups] = useState<GroupEntity[]>([]);
  const [expensesTotal, setExpensesTotal] = useState<number[]>([]);
  const [alert, setAlert] = useState({ visible: false, msg: '' });
  const [isLoading, setIsLoading] = useState(true);

  const userId = getUserId(loginUser);

  useEffect(() => {
    if (userId) {
      fetchUserGroups(userId);
    }
  }, [loginUser, userId]);

  const fetchUserGroups = async (uid: string) => {
    setIsLoading(true);
    try {
      const res = await groupService.listByUser(uid);
      setUserGroups(res.items);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch groups';
      showAlert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGroup = (id: string | null) => {
    if (!id) return;

    modals.openConfirmModal({
      title: 'Delete group',
      children: <Text size="sm">Are you sure you want to delete this group?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await groupService.delete(id);
          if (userId) fetchUserGroups(userId);
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Delete request failed';
          showAlert(msg);
        }
      },
    });
  };

  const showAlert = (msg: string) => {
    setAlert({ visible: true, msg });
    setTimeout(() => setAlert({ visible: false, msg: '' }), 5000);
  };

  useEffect(() => {
    const fetchAllGroupExpenses = async () => {
      const totals = await Promise.all(
        userGroups.map(async (group) => {
          try {
            const res = await groupExpenseService.listByGroup(getEntityId(group) || '');
            return res.items.reduce((sum, item) => sum + item.amount, 0);
          } catch {
            return 0;
          }
        })
      );
      setExpensesTotal(totals);
    };

    if (userGroups.length) fetchAllGroupExpenses();
  }, [userGroups]);

  const rows = isLoading ? (
    <Table.Tr>
      <Table.Td colSpan={5}>
        <Center py="xl">
          <Loader />
        </Center>
      </Table.Td>
    </Table.Tr>
  ) : userGroups.length === 0 ? (
    <Table.Tr>
      <Table.Td colSpan={5}>
        <Text ta="center" c="dimmed" py="lg">
          No groups found
        </Text>
      </Table.Td>
    </Table.Tr>
  ) : (
    userGroups.map((group, index) => {
      const isOwner = getEntityId(group.createdBy) === userId;
      const groupId = getEntityId(group);

      return (
        <Table.Tr key={groupId || index}>
          <Table.Td>{index + 1}</Table.Td>
          <Table.Td>{group.name}</Table.Td>
          <Table.Td>{group.createdBy.name || group.createdBy.email}</Table.Td>
          <Table.Td>
            <CountUp end={expensesTotal[index] || 0} prefix="₹" separator="," />
          </Table.Td>
          <Table.Td>
            <Group gap="xs" wrap="wrap">
              <Button
                component={Link}
                to={`/group/groupmember?grpid=${groupId}&grpname=${group.name}&leader=${getEntityId(group.createdBy)}`}
                size="xs"
                variant="light"
              >
                {isOwner ? 'Members' : 'View Members'}
              </Button>
              <Button
                component={Link}
                to={`/group/groupexpense?grpid=${groupId}&grpname=${group.name}&leader=${getEntityId(group.createdBy)}`}
                size="xs"
                variant="light"
              >
                Expenses
              </Button>
              <Button
                component={Link}
                to={`/group/settlement?grpid=${groupId}&grpname=${group.name}`}
                size="xs"
                variant="light"
              >
                Settlements
              </Button>
              {isOwner && (
                <Menu shadow="md" width={160}>
                  <Menu.Target>
                    <ActionIcon variant="light" size="sm">
                      <IconDots size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      component={Link}
                      to={`/group/editgroup?mode=edit&group=${groupId}`}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => deleteGroup(groupId)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          </Table.Td>
        </Table.Tr>
      );
    })
  );

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>Groups</Title>
          <PageBreadcrumbs items={[{ label: 'Groups', to: '/group' }]} />
        </Group>

        <Group justify="flex-end">
          <Button component={Link} to="addgroup" leftSection={<IconPlus size={16} />}>
            Create New Group
          </Button>
        </Group>

        {alert.visible && (
          <Alert color="red" variant="light">
            {alert.msg}
          </Alert>
        )}

        <Paper shadow="sm" radius="md" withBorder>
          <Table.ScrollContainer minWidth={700}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>S No</Table.Th>
                  <Table.Th>Group Name</Table.Th>
                  <Table.Th>Created By</Table.Th>
                  <Table.Th>Total Expense</Table.Th>
                  <Table.Th>Actions</Table.Th>
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

export default GroupList;
