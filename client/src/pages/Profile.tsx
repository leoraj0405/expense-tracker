import { useEffect, useState } from 'react';
import {
  Title,
  Group,
  Button,
  Alert,
  Paper,
  Stack,
  TextInput,
  FileInput,
  Avatar,
  Text,
  Grid,
  Center,
  Loader,
} from '@mantine/core';
import AppShellLayout from '../layouts/AppShellLayout';
import { PageBreadcrumbs } from '../components/PageBreadcrumbs';
import { useRequireAuth } from '../hooks/useRequireAuth';
import defaultImage from '../assets/img/profile.png';
import { userService } from '../services/userService';
import { ApiError, apiUrl } from '../services/apiClient';
import { saveAuthSession, getToken } from '../utils/authStorage';
import { getUserId, normalizeUser } from '../utils/entity';
import type { User } from '../types/entities';

interface ProfileForm {
  userName: string;
  email: string;
  parentEmail: string;
  profile: File | null;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setForm((prev) => ({ ...prev, profile: file }));
  };

  const handleSubmit = async () => {
    if (!userId) return;

    const formData = new FormData();
    formData.append('name', form.userName);
    formData.append('email', form.email);
    formData.append('parentEmail', form.parentEmail);
    if (form.profile) formData.append('profileImage', form.profile);

    try {
      const res = await userService.update(userId, formData);
      setAlert({ visible: true, message: 'Profile updated successfully!', isError: false });
      const updatedUser = res.item!;
      setUser(updatedUser);
      const normalized = normalizeUser(updatedUser);
      if (normalized) {
        saveAuthSession({ user: normalized, token: getToken() || '' });
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong!';
      setAlert({ visible: true, message: msg, isError: true });
    }
  };

  const profileSrc =
    user?.profileUrl && user.profileUrl !== '/uploads/null'
      ? apiUrl(user.profileUrl)
      : defaultImage;

  const previewSrc =
    form.profile instanceof File ? URL.createObjectURL(form.profile) : profileSrc;

  return (
    <AppShellLayout>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>User Profile</Title>
          <PageBreadcrumbs items={[{ label: 'User Profile', to: '/userprofile' }]} />
        </Group>

        {alert.visible && (
          <Alert color={alert.isError ? 'red' : 'green'} variant="light">
            {alert.message}
          </Alert>
        )}

        {!user ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : (
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper shadow="sm" p="xl" radius="md" withBorder>
                <Stack align="center" gap="sm">
                  <Avatar src={previewSrc} size={120} radius="xl" />
                  <Title order={3}>{user.name?.toUpperCase() || 'User'}</Title>
                  <Text size="sm" c="dimmed">
                    {user.email}
                  </Text>
                  {user.parentEmail && (
                    <Text size="sm">
                      <Text span fw={500}>
                        Parent:
                      </Text>{' '}
                      {user.parentEmail}
                    </Text>
                  )}
                  <Text size="sm" c="dimmed">
                    Joined: {user.createdAt?.split('T')[0]}
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper shadow="sm" p="xl" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Edit Profile</Title>
                  <TextInput
                    label="Name"
                    name="userName"
                    value={form.userName}
                    onChange={handleChange}
                  />
                  <TextInput
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                  <TextInput
                    label="Parent Email"
                    name="parentEmail"
                    type="email"
                    value={form.parentEmail}
                    onChange={handleChange}
                  />
                  <FileInput
                    label="Profile Image"
                    accept="image/*"
                    value={form.profile}
                    onChange={handleFileChange}
                  />
                  <Group justify="flex-end">
                    <Button onClick={handleSubmit}>Save Changes</Button>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        )}
      </Stack>
    </AppShellLayout>
  );
}

export default Profile;
