import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { modals } from '@mantine/modals';
import { Center, Loader, Text, Menu, ActionIcon } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconDots } from '@tabler/icons-react';
import CountUp from 'react-countup';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageHero } from '../../components/ui/PageHero';
import { Panel } from '../../components/ui/Panel';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
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
    <tr className="et-tr-full">
      <td colSpan={5}>
        <Center py="xl">
          <Loader color="navy" />
        </Center>
      </td>
    </tr>
  ) : userGroups.length === 0 ? (
    <tr className="et-tr-full">
      <td colSpan={5}>
        <p className="et-empty-note">No groups found</p>
      </td>
    </tr>
  ) : (
    userGroups.map((group, index) => {
      const isOwner = getEntityId(group.createdBy) === userId;
      const groupId = getEntityId(group);

      return (
        <tr key={groupId || index}>
          <td data-label="S No">{index + 1}</td>
          <td data-label="Group Name" style={{ fontWeight: 600 }}>
            {group.name}
          </td>
          <td data-label="Created By">{group.createdBy.name || group.createdBy.email}</td>
          <td data-label="Total Expense" style={{ fontWeight: 700 }}>
            <CountUp end={expensesTotal[index] || 0} prefix="₹" separator="," />
          </td>
          <td data-label="Actions" className="et-td-actions">
            <div className="et-actions-wrap">
              <Link
                to={`/group/groupmember?grpid=${groupId}&grpname=${group.name}&leader=${getEntityId(group.createdBy)}`}
                className="et-btn et-btn-ghost et-btn-sm"
              >
                {isOwner ? 'Members' : 'View'}
              </Link>
              <Link
                to={`/group/groupexpense?grpid=${groupId}&grpname=${group.name}&leader=${getEntityId(group.createdBy)}`}
                className="et-btn et-btn-ghost et-btn-sm"
              >
                Expenses
              </Link>
              <Link
                to={`/group/settlement?grpid=${groupId}&grpname=${group.name}`}
                className="et-btn et-btn-ghost et-btn-sm"
              >
                Settle
              </Link>
              {isOwner && (
                <Menu shadow="md" width={160}>
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="sm" color="navy">
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
            </div>
          </td>
        </tr>
      );
    })
  );

  return (
    <AppShellLayout>
      <PageHero
        title="Groups"
        subtitle="Shared expenses with friends and family."
        action={
          <Link to="addgroup" className="et-btn et-btn-primary">
            <IconPlus size={15} /> Create group
          </Link>
        }
      />

      {alert.visible && <div className="et-alert et-alert-error">{alert.msg}</div>}

      <Panel title="Your groups" hint={`${userGroups.length} group${userGroups.length !== 1 ? 's' : ''}`}>
        <ResponsiveTable minWidth={720}>
          <thead>
            <tr>
              <th>S No</th>
              <th>Group Name</th>
              <th>Created By</th>
              <th>Total Expense</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </ResponsiveTable>
      </Panel>
    </AppShellLayout>
  );
}

export default GroupList;
