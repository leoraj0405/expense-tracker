'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Button,
  Stack,
  TextInput,
  Text,
  Center,
  Loader,
  Group,
  Divider,
} from '@mantine/core';
import {
  IconMail,
  IconUser,
  IconUsers,
  IconCalendar,
  IconShield,
} from '@tabler/icons-react';
import AppShellLayout from '@/layouts/AppShellLayout';
import { PageHero } from '@/components/ui/PageHero';
import { Panel } from '@/components/ui/Panel';
import { ProfilePhotoUpload } from '@/components/ui/ProfilePhotoUpload';
import { useRequireAuth } from '@/hooks/useRequireAuth';
const defaultImage = '/profile.png';

import { userService } from '@/services/userService';
import { ApiError, resolveAssetUrl } from '@/services/apiClient';
import { saveAuthSession, getToken } from '@/utils/authStorage';
import { getUserId, normalizeUser } from '@/utils/entity';
import { formatDisplayDate } from '@/utils/date';
import { getInitials } from '@/utils/format';
import type { User } from '@/types/entities';

interface ProfileForm {
  userName: string;
  email: string;
  parentEmail: string;
  profile: File | null;
}

function ProfileInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="et-profile-info-row">
      <div className="et-profile-info-icon">{icon}</div>
      <div>
        <div className="et-profile-info-label">{label}</div>
        <div className="et-profile-info-value">{value}</div>
      </div>
    </div>
  );
}

function Profile() {
  const loginUser = useRequireAuth();
  const userId = getUserId(loginUser);

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    userName: '',
    email: '',
    parentEmail: '',
    profile: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: '', isError: false });

  useEffect(() => {
    if (!userId) return;

    userService
      .getById(userId)
      .then((res) => {
        const userData = res.item!;
        setUser(userData);
        setForm({
          userName: userData.name || '',
          email: userData.email || '',
          parentEmail: userData.parentEmail || '',
          profile: null,
        });
      })
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : 'Failed to fetch user';
        setAlert({ visible: true, message: msg, isError: true });
      });
  }, [userId]);

  useEffect(() => {
    if (!alert.visible) return;
    const timer = setTimeout(() => setAlert({ visible: false, message: '', isError: false }), 5000);
    return () => clearTimeout(timer);
  }, [alert.visible]);

  const profileSrc = useMemo(() => {
    if (user?.profileUrl && user.profileUrl !== '/uploads/null') {
      return resolveAssetUrl(user.profileUrl);
    }
    if (user?.profileImage && user.profileImage !== 'null') {
      return resolveAssetUrl(user.profileImage);
    }
    return defaultImage;
  }, [user]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (form.profile instanceof File) {
      const url = URL.createObjectURL(form.profile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [form.profile]);

  const displayPreview = previewUrl || profileSrc;
  const hasCustomAvatar =
    Boolean(user?.profileImage && user.profileImage !== 'null') || Boolean(form.profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    const formData = new FormData();
    formData.append('name', form.userName.trim());
    formData.append('email', form.email.trim());
    formData.append('parentEmail', form.parentEmail.trim());
    if (form.profile) formData.append('profileImage', form.profile);

    try {
      const res = await userService.update(userId, formData);
      setAlert({ visible: true, message: 'Profile updated successfully!', isError: false });
      const updatedUser = res.item!;
      setUser(updatedUser);
      setForm((prev) => ({ ...prev, profile: null }));
      const normalized = normalizeUser(updatedUser);
      if (normalized) {
        saveAuthSession({ user: normalized, token: getToken() || '' });
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong!';
      setAlert({ visible: true, message: msg, isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const joinedLabel = user?.createdAt
    ? formatDisplayDate(user.createdAt.split('T')[0])
    : '—';

  return (
    <AppShellLayout>
      <PageHero
        title="My profile"
        subtitle="Manage your personal details and profile photo."
      />

      {alert.visible && (
        <div className={`et-alert ${alert.isError ? 'et-alert-error' : 'et-alert-success'}`}>
          {alert.message}
        </div>
      )}

      {!user ? (
        <Center py="xl">
          <Loader color="navy" />
        </Center>
      ) : (
        <div className="et-profile-layout">
          <aside className="et-profile-sidebar">
            <div className="et-profile-identity">
              <div className="et-profile-identity-banner" aria-hidden />
              <div className="et-profile-identity-body">
                <div className="et-profile-identity-avatar">
                  {hasCustomAvatar ? (
                    <img src={displayPreview} alt={user.name || 'Profile'} />
                  ) : (
                    <span>{getInitials(user.name || 'User')}</span>
                  )}
                </div>
                <Text className="et-profile-identity-name">{user.name || 'User'}</Text>
                <Text className="et-profile-identity-email">{user.email}</Text>
                <span className="et-profile-identity-badge">
                  <IconShield size={14} />
                  Personal account
                </span>
              </div>
            </div>

            <Panel title="Account details" hint="Your registered information">
              <Stack gap="sm">
                <ProfileInfoRow
                  icon={<IconUser size={18} />}
                  label="Full name"
                  value={user.name || '—'}
                />
                <ProfileInfoRow
                  icon={<IconMail size={18} />}
                  label="Email"
                  value={user.email || '—'}
                />
                <ProfileInfoRow
                  icon={<IconUsers size={18} />}
                  label="Parent email"
                  value={user.parentEmail || 'Not set'}
                />
                <ProfileInfoRow
                  icon={<IconCalendar size={18} />}
                  label="Member since"
                  value={joinedLabel}
                />
              </Stack>
            </Panel>
          </aside>

          <section className="et-profile-main">
            <Panel title="Edit profile" hint="Update your details and photo">
              <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                  <div>
                    <Text fw={600} size="sm" mb="md">
                      Profile photo
                    </Text>
                    <ProfilePhotoUpload
                      previewSrc={displayPreview}
                      file={form.profile}
                      onChange={(file) => setForm((prev) => ({ ...prev, profile: file }))}
                      userName={form.userName}
                    />
                  </div>

                  <Divider />

                  <div className="et-profile-form-grid">
                    <TextInput
                      label="Full name"
                      name="userName"
                      placeholder="Your name"
                      value={form.userName}
                      onChange={handleChange}
                      required
                    />
                    <TextInput
                      label="Email address"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <TextInput
                      label="Parent email"
                      name="parentEmail"
                      type="email"
                      placeholder="parent@example.com"
                      description="Used for parent dashboard access"
                      value={form.parentEmail}
                      onChange={handleChange}
                      className="et-profile-form-full"
                    />
                  </div>

                  <Group justify="flex-end" mt="sm" wrap="wrap">
                    <Button
                      type="submit"
                      loading={isSaving}
                      className="et-btn et-btn-primary"
                    >
                      Save changes
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Panel>
          </section>
        </div>
      )}
    </AppShellLayout>
  );
}

export default Profile;
