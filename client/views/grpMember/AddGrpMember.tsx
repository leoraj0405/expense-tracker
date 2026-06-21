'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Group, Button, Stack, Text, Autocomplete, Loader } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import AppShellLayout from '@/layouts/AppShellLayout';
import { PageHero } from '@/components/ui/PageHero';
import { Panel } from '@/components/ui/Panel';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useQueryParams } from '@/hooks/useQueryParams';
import { groupMemberService } from '@/services/groupMemberService';
import { userService } from '@/services/userService';
import { ApiError } from '@/services/apiClient';

interface MemberOption {
  value: string;
  label: string;
  name: string;
}

function formatMemberOption(user: { name?: string | null; email: string }): MemberOption {
  const name = user.name?.trim() || '';
  return {
    value: user.email,
    label: name ? `${name} (${user.email})` : user.email,
    name,
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function resolveEmail(input: string, options: MemberOption[]): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const matched = options.find(
    (option) =>
      option.value === trimmed ||
      option.label === trimmed ||
      option.label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (matched) return matched.value;

  const fromLabel = trimmed.match(/\(([^\s@]+@[^\s)]+)\)\s*$/);
  if (fromLabel?.[1]) return fromLabel[1];

  return trimmed;
}

function buildMembersListUrl(
  groupId: string | null,
  groupName: string | null,
  groupLeader: string | null,
): string {
  const params = new URLSearchParams();
  if (groupId) params.set('grpid', groupId);
  if (groupName) params.set('grpname', groupName);
  if (groupLeader) params.set('leader', groupLeader);
  const qs = params.toString();
  return `/group/groupmember${qs ? `?${qs}` : ''}`;
}

function AddGrpMember() {
  useRequireAuth();
  const router = useRouter();
  const queryParams = useQueryParams();

  const groupId = queryParams.get('grpid');
  const groupName = queryParams.get('grpname');
  const groupLeader = queryParams.get('leader');
  const membersListUrl = buildMembersListUrl(groupId, groupName, groupLeader);

  const [inputValue, setInputValue] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [options, setOptions] = useState<MemberOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '' });

  const [debouncedQuery] = useDebouncedValue(inputValue, 300);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 10000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  useEffect(() => {
    const query = debouncedQuery.trim();
    if (query.length < 2) {
      setOptions([]);
      return;
    }

    let cancelled = false;

    const searchMembers = async () => {
      setIsSearching(true);
      try {
        const res = await userService.searchUsers(query, groupId || undefined);
        if (cancelled) return;
        setOptions(res.items.map((user) => formatMemberOption(user)));
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };

    searchMembers();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, groupId]);

  const resolvedEmail = useMemo(
    () => selectedEmail || resolveEmail(inputValue, options),
    [selectedEmail, inputValue, options],
  );

  const canSubmit = Boolean(groupId && isValidEmail(resolvedEmail) && !isSubmitting);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const email = resolveEmail(value, options);
    setSelectedEmail(isValidEmail(email) ? email : '');
  };

  const handleOptionSubmit = (value: string) => {
    const match = options.find((option) => option.value === value);
    setSelectedEmail(value);
    setInputValue(match?.label || value);
  };

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();

      if (!groupId) {
        setAlert({ show: true, message: 'Group is missing. Go back and open Add member from a group.' });
        return;
      }

      const email = (selectedEmail || resolveEmail(inputValue, options)).trim();
      if (!isValidEmail(email)) {
        setAlert({ show: true, message: 'Enter a valid email or pick a user from the list.' });
        return;
      }

      setIsSubmitting(true);
      setAlert({ show: false, message: '' });

      try {
        await groupMemberService.create({ groupId, email });
        router.push(membersListUrl);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Failed to add group member';
        setAlert({ show: true, message: msg });
      } finally {
        setIsSubmitting(false);
      }
    },
    [groupId, selectedEmail, inputValue, options, membersListUrl, router],
  );

  return (
    <AppShellLayout>
      <PageHero title="Add group member" subtitle={`Invite someone to ${groupName}.`} />

      {alert.show && <div className="et-alert et-alert-error">{alert.message}</div>}

      <Panel title="Member details">
        <form onSubmit={handleSubmit}>
          <Stack gap="md" maw={520}>
            <Text style={{ color: 'var(--et-ink-soft)' }} fw={500}>
              Group: {groupName}
            </Text>

            <Autocomplete
              label="Search member"
              description="Pick an existing user or type a new email to invite"
              placeholder="Search by name or email"
              data={options}
              value={inputValue}
              onChange={handleInputChange}
              onOptionSubmit={handleOptionSubmit}
              filter={({ options: filteredOptions }) => filteredOptions}
              leftSection={<IconSearch size={16} stroke={1.75} />}
              rightSection={isSearching ? <Loader size="xs" color="navy" /> : null}
              renderOption={({ option }) => {
                const match = options.find((item) => item.value === option.value);
                return (
                  <div>
                    <Text size="sm" fw={500}>
                      {match?.name || option.value}
                    </Text>
                    {match?.name && (
                      <Text size="xs" c="dimmed">
                        {option.value}
                      </Text>
                    )}
                  </div>
                );
              }}
              limit={10}
              required
            />

            {debouncedQuery.trim().length >= 2 && !isSearching && options.length === 0 && (
              <Text size="xs" c="dimmed">
                No matching users. Enter a full email to invite someone new.
              </Text>
            )}

            {resolvedEmail && isValidEmail(resolvedEmail) && (
              <Text size="xs" c="dimmed">
                Will add: {resolvedEmail}
              </Text>
            )}

            <Group justify="flex-end" mt="md" wrap="wrap">
              <Button
                component={Link}
                href={membersListUrl}
                variant="default"
                className="et-btn et-btn-ghost"
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                loading={isSubmitting}
                className="et-btn et-btn-primary"
              >
                Add member
              </Button>
            </Group>
          </Stack>
        </form>
      </Panel>
    </AppShellLayout>
  );
}

export default AddGrpMember;
