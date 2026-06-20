import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { modals } from '@mantine/modals';
import { Center, Loader, Text } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import AppShellLayout from '../../layouts/AppShellLayout';
import { PageHero } from '../../components/ui/PageHero';
import { Panel } from '../../components/ui/Panel';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getUserId, getEntityId } from '../../utils/entity';
import { groupMemberService } from '../../services/groupMemberService';
import { ApiError } from '../../services/apiClient';
import type { GroupMember } from '../../types/entities';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function GrpMember() {
  const queryParams = useQuery();
  const loginUser = useRequireAuth();

  const [alert, setAlert] = useState({ show: false, message: '' });
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const groupId = queryParams.get('grpid');
  const groupName = queryParams.get('grpname') || 'Group';
  const groupLeader = queryParams.get('leader');
  const isGroupLeader = groupLeader === getUserId(loginUser);
  const colSpan = isGroupLeader ? 3 : 2;

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
    <tr className="et-tr-full">
      <td colSpan={colSpan}>
        <Center py="xl">
          <Loader color="navy" />
        </Center>
      </td>
    </tr>
  ) : groupMembers.length === 0 ? (
    <tr className="et-tr-full">
      <td colSpan={colSpan}>
        <p className="et-empty-note">No members found</p>
      </td>
    </tr>
  ) : (
    groupMembers.map((member, index) => (
      <tr key={getEntityId(member) || index}>
        <td data-label="#">{index + 1}</td>
        <td data-label="Member">{member.user?.name || `New user (${member.user?.email})`}</td>
        {isGroupLeader && (
          <td data-label="Actions" className="et-td-actions">
            <div className="et-actions-wrap">
              <button
                type="button"
                className="et-btn et-btn-ghost et-btn-sm"
                style={{ color: 'var(--et-red)' }}
                onClick={() => handleDeleteMember(getEntityId(member))}
              >
                <IconTrash size={14} /> Remove
              </button>
            </div>
          </td>
        )}
      </tr>
    ))
  );

  return (
    <AppShellLayout>
      <PageHero
        title={`${groupName} — Members`}
        subtitle="People sharing this group."
        action={
          <Link
            to={`/group/groupmember/addgroupmember?grpid=${groupId}&grpname=${encodeURIComponent(groupName)}&leader=${groupLeader || ''}`}
            className="et-btn et-btn-primary"
          >
            <IconPlus size={15} /> Add members
          </Link>
        }
      />

      {alert.show && <div className="et-alert et-alert-error">{alert.message}</div>}

      <Panel title="Group members" hint={`${groupMembers.length} member${groupMembers.length !== 1 ? 's' : ''}`}>
        <ResponsiveTable minWidth={400}>
          <thead>
            <tr>
              <th>#</th>
              <th>Member</th>
              {isGroupLeader && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </ResponsiveTable>
      </Panel>
    </AppShellLayout>
  );
}

export default GrpMember;
