'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Anchor,
} from '@mantine/core';
import { IconUser, IconLock, IconArrowDown } from '@tabler/icons-react';
import AuthLayout from '@/layouts/AuthLayout';
import { saveAuthSession } from '@/utils/authStorage';
import { normalizeUser } from '@/utils/entity';
import { userService } from '@/services/userService';
import { ApiError } from '@/services/apiClient';

function Login() {
  const [formData, setFormData] = useState({
    email: 'leoraj04065@gmail.com',
    password: '12313',
  });
  const [uiState, setUiState] = useState({
    isLoading: false,
    error: { show: false, message: '' },
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showError = (message: string) => {
    setUiState((prev) => ({
      ...prev,
      error: { show: true, message },
      isLoading: false,
    }));
  };

  const handleSubmit = useCallback(async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true, error: { show: false, message: '' } }));
      const res = await userService.login({
        email: formData.email,
        password: formData.password,
      });

      saveAuthSession({
        user: normalizeUser(res.item!.loggedUserData)!,
        token: res.item!.token,
      });
      router.push('/home');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Network error. Please try again.';
      showError(msg);
    }
  }, [formData, router]);

  return (
    <AuthLayout
      sidePanel={
        <Stack justify="center" align="center" h="100%" gap="md">
          <Title order={2} style={{ color: '#fff', textAlign: 'center', fontFamily: 'Space Grotesk, sans-serif' }}>
            Parent Login
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
            Are you a parent?
          </Text>
          <IconArrowDown color="white" size={24} />
          <Button component={Link} href="/parentlogin" className="et-btn et-btn-amber" style={{ width: '100%' }}>
            Parent Login
          </Button>
        </Stack>
      }
    >
      <Stack gap="lg">
        <div>
          <Title order={2} ta="center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome back
          </Title>
          <Text size="sm" ta="center" mt={4} style={{ color: 'var(--et-ink-soft)' }}>
            Sign in to manage your expenses
          </Text>
        </div>

        <Stack gap="md">
          <TextInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            leftSection={<IconUser size={16} />}
            required
          />
          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            leftSection={<IconLock size={16} />}
            required
            minLength={3}
          />
        </Stack>

        {uiState.error.show && (
          <div className="et-alert et-alert-error">{uiState.error.message}</div>
        )}

        <Group justify="space-between" align="center">
          <Button
            onClick={handleSubmit}
            loading={uiState.isLoading}
            className="et-btn et-btn-primary"
            style={{ width: '100%' }}
          >
            Login
          </Button>
        </Group>

        <Group justify="space-between">
          <Anchor component={Link} href="/forgetpassword" size="sm" style={{ color: 'var(--et-navy)' }}>
            Forgot password?
          </Anchor>
          <Anchor component={Link} href="/registration" size="sm" style={{ color: 'var(--et-navy)' }}>
            Create account
          </Anchor>
        </Group>
      </Stack>
    </AuthLayout>
  );
}

export default Login;
